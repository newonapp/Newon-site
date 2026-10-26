/**
 * BABYLOG corporate website — design pass v3 content (2026-10-26).
 *
 * Owner request: "더 다양하게 깔끔하게, 여백은 줄이고, 내용은 더 자세하게". This module adds detail that the
 * integrated business plan ("BABYLOG 최종 통합 사업계획서", 2026-10-20) already states but the site did not show yet:
 *   - per-area detail tables for 13 of the 27 long-term areas (plan §4–§16, §20, §25)
 *   - the proposed app menu structure (plan §22) and the development stages P0–P9 (plan §24)
 *   - what BABYLOG does not do (plan §6, §15, §19–§26, §25 operating/legal table)
 *   - how BABYLOG connects to the other NEWON platforms (plan §23)
 *   - the 12 revenue models with their method and what has to be validated first (plan §9–§16, §18–§19)
 *   - two operating/legal checks not yet listed (plan §25: school/education, young people leaving care)
 *   - partnership and contact preparation guidance (paraphrased from the existing site copy)
 * Rewritten for visitors; NOT reviewed by the owner. ko = primary, en = draft.
 *
 * Public / private rule (qa-babylog-site.mjs): no price, fee rate, fee amount, revenue or user figure appears here.
 * Future items stay labelled as plans / under review; no new partners, dates, countries or results.
 */

/* =========================================================================== KO */
const KO = {
  overview: {
    diffFields: { a: "기존 대안", b: "BABYLOG가 지향하는 것", why: "무엇이 다른가" },
    /** plan §23 — what each NEWON platform does together with BABYLOG (keyed by the platform tile name) */
    links: {
      label: "BABYLOG와",
      items: {
        PETLOG: "반려동물과 아이가 함께하는 가족생활",
        "MY WORLD": "가족 여행·체험과 그 추억",
        SHAREON: "육아·가족 용품의 대여",
        LIVON: "임신·출산·가족 제도, 진로, 성인 전환 이후의 생활",
        ONGIL: "조부모·가족 돌봄과 세대 활동",
      },
    },
    /** plan §6, §9–§10, §15, §19–§26 — boundaries, shown under the Trust principles */
    limits: {
      title: "하지 않는 것도\n분명히 정해 두었습니다.",
      lead: "아이와 가족의 정보를 다루는 만큼, 기능을 만들기 전에 하지 않을 일을 먼저 정했습니다. 통합 사업계획서와 운영 원칙에 적힌 기준입니다.",
      fields: { area: "영역", no: "하지 않는 것", instead: "대신 하는 것" },
      items: [
        ["AI", "의료 진단, 발달 장애 판정, 실종 아동 얼굴 자동 식별, 위탁·입양 대상 아동 선정", "기록을 참고용으로 요약하고 일반 정보를 안내합니다."],
        ["실종 아동", "검증되지 않은 사진·신상·위치의 공개 게시, 신고 접수", "112 등 공식 신고 경로와 확인된 공공기관 공지로 연결합니다."],
        ["가정위탁·입양", "아동 프로필 공개, 아동 검색·선택, 개인 간 직접 매칭, 입양 성사 수수료", "공식 제도와 절차, 담당 기관을 안내합니다."],
        ["보호 아동·자립준비청년", "얼굴·실명·거주 정보·사례 기록의 공개, 보호 이력의 커뮤니티·광고 활용", "공식 기관 정보와 지원 제도를 연결합니다."],
        ["기부·후원", "법적 요건과 계약을 갖추기 전의 기부금 직접 모금·보관", "공식 기부·봉사 채널로 안내합니다."],
        ["광고·데이터", "아동 데이터 기반의 개인화 광고, 아동·가족 데이터 판매", "성장 단계 카테고리를 기준으로 정보를 보여 줍니다."],
        ["의료기관", "환자 알선, 진료비에 비례한 수수료", "병원 정보·일정과 공식 예약 경로만 안내합니다."],
        ["가족 기록", "성인이 된 자녀의 기록을 부모에게 계속 자동 공개, 기록의 접근·내보내기·삭제를 부당하게 제한", "성인이 되면 본인 계정으로 넘기고, 공유 범위는 가족이 정합니다."],
        ["다른 NEWON 앱", "아동·건강·가족 데이터의 자동 공유", "명시적 동의와 적법한 권한이 있을 때만 연결합니다."],
      ],
    },
  },

  platform: {
    /** plan §4–§16, §20, §25 — opened from the area list (collapsed by default) */
    detail: {
      summary: "세부 구성 보기",
      fields: { k: "구성", v: "내용" },
      areas: {
        "01": {
          now: "지금 앱에서는 아이 프로필, 가족 공유, 병원·교육·가족 일정을 이용합니다. 나머지 구성은 계획입니다.",
          rows: [["가족 연결", "부모·보호자·가족 구성원"], ["자녀 프로필", "생년월일·성장 단계"], ["공동 일정", "병원·학교·가족 일정"], ["역할 권한", "부모·보호자·청소년"], ["공동 기록", "허용된 건강·성장 기록"], ["가족 알림", "일정·할 일·중요 공지"], ["공동 구매", "가족 물품·구독 관리"], ["청소년 계정", "연령에 맞는 독립 권한"], ["성인 전환", "본인 정보·계정 관리"]],
          note: "가족 연결은 관계 증명이나 적법한 권한 확인이 필요한 상황을 고려해 설계합니다.",
        },
        "03": {
          now: "지금 앱에서는 키·몸무게와 성장 통계, 수유·수면·기저귀·식사 기록, 예방접종·건강 기록, 병원 일정을 이용합니다. 연령별 발달 기록과 성장 앨범은 계획입니다.",
          rows: [["성장", "키·몸무게·성장 그래프"], ["수유", "모유·분유·수유 기록"], ["수면", "수면 시간·패턴"], ["기저귀", "배변·교체 기록"], ["이유식", "식단·섭취 기록"], ["예방접종", "공식 일정·접종 기록"], ["병원", "진료 일정·건강 메모"], ["발달", "연령별 발달 기록"], ["생활", "습관·일정·활동"], ["성장 앨범", "사진·영상·기념일"]],
          note: "발달 평가나 의료적 판단은 전문 의료진을 대체하지 않으며, AI가 아동의 질환을 진단하지 않도록 설계합니다.",
        },
        "04": {
          now: "향후 계획 영역입니다. 병원·교육 일정 등록은 지금 앱에서도 할 수 있습니다.",
          rows: [["학교 일정", "시간표·시험·방학·행사"], ["학습 관리", "공부 계획·과제·진행률"], ["진로 탐색", "적성·직업·진학 정보"], ["교육 콘텐츠", "영상·문제·학습 자료"], ["학원·기관", "교육기관 탐색·후기"], ["상담", "진로·교육 상담 일정"], ["방과 후", "프로그램·체험 탐색"], ["학부모", "일정·준비물 공동 관리"]],
          note: "학교와 기관의 공식 정보를 연동할 때는 출처·사용 권한·개인정보 보호를 먼저 확인합니다.",
        },
        "06": {
          now: "향후 계획 영역입니다. 어린이집·유치원·학원·산후도우미·돌봄 제공자·교육기관을 비교하는 신뢰 서비스로 설계합니다.",
          fields: { k: "검증 항목", v: "운영 방식" },
          rows: [["기관 등록", "공식 등록 여부 확인"], ["자격", "확인 가능한 자격·인증 표시"], ["실제 이용 후기", "이용 여부 검증"], ["비용", "기본 요금·추가 비용 공개"], ["안전", "신고·제재·분쟁 대응"], ["광고", "유료 광고와 일반 후기 구분"], ["정보 갱신", "최근 확인일 표시"]],
          note: "아동의 신원·건강·학교생활 정보가 후기에서 드러나지 않도록 제한합니다.",
        },
        "09": {
          now: "탐색·예약은 다음 앱 버전에서 준비 중입니다. 웹사이트에서는 예약을 받지 않습니다.",
          fields: { k: "예약 분야", v: "서비스" },
          rows: [["교육", "상담·체험·수업"], ["돌봄", "적법한 돌봄 서비스"], ["생활", "가족 사진·미용·생활 서비스"], ["체험", "가족 체험·키즈 프로그램"], ["시설", "키즈 공간·행사 시설"], ["건강", "병원 정보·공식 예약 경로"]],
          note: "의료기관 환자 알선이나 진료비에 비례한 수수료는 일반 예약 수수료처럼 운영하지 않습니다.",
        },
        "10": {
          now: "향후 계획 영역입니다. 상품 형태와 조건은 정해지지 않았습니다.",
          rows: [["추천", "그림책·동화책·학습 도서·전자책·오디오북을 성장 단계에 맞게"], ["확장", "도서 판매, 출판사 제휴, 정기 도서 배송, 라이선스를 확보한 콘텐츠"], ["상품 형태", "디지털 도서 구독, 실물 도서 배송, 개별 도서 판매를 검토"]],
          note: "전자책·오디오북은 저작권과 앱스토어 디지털 결제 정책을 먼저 검토합니다.",
        },
        "11": {
          now: "검토 단계의 구상입니다.",
          rows: [["연령별 추천", "성장 단계에 맞는 장난감"], ["대여 기간", "정기 배송과 반납"], ["반납·교환", "다음 단계 장난감으로 교환"], ["위생 관리", "회수 후 세척·점검"], ["파손 정책", "파손·분실 기준"], ["가족 구독", "가족 단위 구독"]],
          note: "초기에는 검증된 장난감 렌털 업체와 제휴하고, 위생·안전·배송·분실 비용을 검증한 뒤 직접 운영을 넓히는 순서를 권장합니다.",
        },
        "13": {
          now: "검토 단계의 구상입니다. 보호자가 선물하는 정기구독, 기업 출산 축하 선물, 가족 복지 상품으로도 검토합니다.",
          fields: { k: "구성", v: "담기는 것" },
          rows: [["Pregnancy Box", "임신·출산 준비용품"], ["Newborn Box", "신생아 생활용품"], ["Baby Care Box", "기저귀·위생 소모품"], ["Toddler Box", "유아 놀이·학습 용품"], ["School Box", "학교 준비·학습 물품"], ["Custom Box", "가족 맞춤 구성"]],
          note: "실물 정기배송은 판매액 전체가 이익이 아니므로 원가·배송·포장·반품·재고를 따로 계산해 검증합니다.",
        },
        "14": {
          now: "검토 단계의 구상입니다. 연동할 기기와 제조사는 정해지지 않았습니다.",
          fields: { k: "기기", v: "역할" },
          rows: [["Baby Monitor", "아기 모니터·환경 확인"], ["Kids Tablet", "아동 학습·가족 기능"], ["Smart Sensor", "온습도·실내 환경 관리"], ["Story Speaker", "동화·음성 콘텐츠·학습"]],
          note: "카메라와 위치·음성 기능은 동의, 접근 권한, 암호화, 보관 기간, 기기 보안, KC 인증을 우선 확인합니다.",
        },
        "15": {
          now: "지금 앱에서는 참고용 AI 기록 요약을 제공합니다. 나머지 AI 서비스는 계획·검토 단계입니다.",
          fields: { k: "AI 서비스", v: "하는 일" },
          rows: [["Pregnancy AI", "임신·출산 일정 보조"], ["Baby Care AI", "육아 기록 요약"], ["Growth AI", "성장 기록 시각화"], ["Family AI", "가족 일정·할 일"], ["Learning AI", "학습·복습·설명"], ["School AI", "학교 일정·준비물"], ["Books AI", "연령별 도서 추천"], ["Toy AI", "발달 단계별 놀이 제안"], ["Safety AI", "안전 정보·체크리스트"], ["Welfare AI", "공식 지원 제도 탐색"]],
          note: "AI는 의료 진단, 아동 발달 장애 판정, 실종 아동 얼굴 자동 식별, 입양·위탁 대상 아동 선정을 하지 않습니다.",
        },
        "20": {
          now: "향후 계획 영역입니다. 공식 정보 안내와 긴급 연락 경로는 개발 단계 P3부터 제공하는 것을 계획합니다.",
          fields: { k: "기능", v: "내용" },
          rows: [["안전 교육", "실종 예방·생활 안전"], ["보호자 연락망", "긴급 연락처 관리"], ["귀가·외출", "동의 기반 일정·안전 확인"], ["공식 신고", "112·119 등 연결"], ["보호기관 정보", "공식 아동 보호기관 안내"], ["안전 콘텐츠", "연령별 교육 자료"], ["기관 협력", "학교·복지관·공공기관"]],
          note: "아동 위치 기능은 상시 감시보다 안전 목적에 필요한 최소 기능으로 제한하고, 연령에 따른 아동의 권리와 보호자 권한을 함께 고려합니다.",
        },
        "25": {
          now: "향후 계획 영역입니다. 실제 기관 연계는 검증된 협력과 보호 체계를 갖춘 뒤 진행합니다.",
          fields: { k: "영역", v: "주요 서비스" },
          rows: [["주거", "자립 주거·공식 지원 제도"], ["교육", "장학금·교육·자격증"], ["취업", "채용·직무·경력 준비"], ["금융", "생활 예산·금융 교육"], ["상담", "공식 상담기관 연결"], ["멘토링", "검증된 멘토·기관 프로그램"], ["생활", "계약·행정·일상 관리"], ["LIVON 연결", "성인 생활·취업·주거 관리"]],
          note: "자립준비청년의 개인정보와 보호 이력은 특히 민감하므로 일반 커뮤니티나 광고 타기팅에 쓰지 않습니다.",
        },
      },
    },
    /** plan §22 — proposed bottom-tab structure (not the current app screens) */
    menu: {
      title: "앱 메뉴 구조 제안",
      lead: "통합 사업계획서가 제안하는 하단 탭 다섯 개입니다. 기능이 늘어나도 가족이 찾는 위치가 흔들리지 않도록 묶었습니다.",
      items: [
        { name: "홈", lead: "가족 일정, 성장 요약, 오늘의 할 일, 안전 안내" },
        { name: "성장", lead: "임신·육아·건강·학교·학습·성장 기록" },
        { name: "발견", lead: "기관·예약·마켓·Books·Toy Club·복지·안전" },
        { name: "커뮤니티", lead: "가족 경험·질문·후기·정보 공유" },
        { name: "마이", lead: "가족 계정·권한·구독·기기·설정" },
      ],
      note: "제안 구조이며 현재 앱 화면과 다를 수 있습니다. 아동 보호 관련 긴급 기능은 복잡한 메뉴에 숨기지 않고 명확하게 보이도록 합니다.",
    },
    /** plan §24 — development stages */
    dev: {
      title: "개발 단계 P0–P9",
      lead: "기능 상태와 별도로, 개발은 아래 순서로 진행하는 것을 계획합니다. 단계는 추진 순서이며 출시일이 아닙니다.",
      fields: { stage: "단계", scope: "개발 범위", goal: "목표" },
      items: [
        ["P0", "기존 코드·데이터·디자인·백업 보존", "안전한 개발 기준선"],
        ["P1", "가족 계정·임신·성장·건강·캘린더", "핵심 일상 기능"],
        ["P2", "학교·학습·진로·Family Trust", "성장 전 과정"],
        ["P3", "안전·공식 실종 신고 안내·복지 정보", "무료 안전 기반"],
        ["P4", "커뮤니티·기관 탐색·예약", "사용자·기관 연결"],
        ["P5", "쇼핑·중고·공동구매·Books", "거래 수익화 검증"],
        ["P6", "Toy Club·Family Box·구독·AI", "반복 이용"],
        ["P7", "교육·육아기관 SaaS·스마트 기기", "B2B·하드웨어"],
        ["P8", "위탁·입양 정보·후원·자립준비청년", "공식 기관 협력"],
        ["P9", "공공·기업 제휴·글로벌", "장기 확장"],
      ],
      note: "P8의 공익 기능 중 공식 정보 안내와 긴급 연락은 P3부터 제공할 수 있습니다. 실제 기관 연계·운영은 검증된 파트너십과 보호 체계가 필요합니다.",
    },
  },

  business: {
    /** plan §20 — product structure hypothesis (names and scope only; prices are unvalidated and not shown) */
    tiers: {
      kicker: "Product Structure",
      title: "검증할 상품 구성,\n가족용과 기관용.",
      lead: "통합 사업계획서가 제안하는 상품 구성입니다. 지금 판매하는 상품은 개인 Premium 구독 하나이며, 아래 구성과 요금은 검증 전 가설이라 판매하지 않고 가격도 표시하지 않습니다.",
      familyTitle: "개인·가족 구독 구성(제안)",
      orgTitle: "기업·기관 구독 구성(제안)",
      fields: { name: "구성", what: "주요 내용" },
      family: [
        ["BABYLOG Free", "기본 성장·건강·가족 기록"],
        ["BABYLOG Plus", "고급 통계·기록·저장"],
        ["BABYLOG Pro", "AI·고급 가족 관리"],
        ["BABYLOG Books", "라이선스를 확보한 디지털 도서"],
        ["BABYLOG Learning", "고급 학습 콘텐츠"],
        ["Books Box · Toy Club", "실물 도서 배송, 장난감 정기 대여"],
      ],
      org: [
        ["Business Free", "기본 기관 등록"],
        ["Business Starter", "소규모 기관"],
        ["Business Growth", "다수 직원·프로그램"],
        ["Business Pro", "고급 운영·분석"],
        ["Enterprise", "대형 기업·공공기관, 별도 계약"],
      ],
      note: "Family Box는 구성·배송 원가에 따라 따로 정하고, 아동복지기관용 도구는 공익 목적과 기관 예산을 고려한 별도 지원 정책을 마련합니다.",
    },
    /** plan §23 + existing NEWON-connection copy — who does what across NEWON */
    roles: {
      kicker: "Across NEWON",
      title: "NEWON 안에서\n사업이 겹치지 않도록.",
      lead: "BABYLOG는 다른 NEWON 플랫폼과 역할을 나누어, 같은 가족에게 같은 서비스를 두 번 팔거나 한 거래에 수수료를 이중으로 매기지 않는 구조를 원칙으로 합니다.",
      fields: { platform: "플랫폼", link: "BABYLOG와 이어지는 지점", split: "역할 구분" },
      items: [
        ["LIVON", "임신·출산·가족·진로·성인 전환", "출산 지원금·육아휴직 같은 생활 제도 안내는 LIVON, 아이의 기록과 육아는 BABYLOG"],
        ["SHAREON", "육아·가족 용품 대여", "쇼핑·중고·공동구매는 BABYLOG 마켓, 대여는 SHAREON. 한 거래에 수수료를 이중으로 매기지 않습니다."],
        ["PETLOG", "반려동물과 아이가 함께하는 가족생활", "반려동물 기록과 서비스는 PETLOG"],
        ["ONGIL", "조부모·가족 돌봄과 세대 활동", "시니어 생활·돌봄은 ONGIL, 손주 돌봄 기록 공유는 BABYLOG 가족 공유"],
        ["MY WORLD", "가족 여행·체험과 추억", "여행 기록과 여행 서비스는 MY WORLD"],
      ],
      note: "서로 다른 앱의 아동·건강·가족 데이터는 명시적 동의와 적법한 권한 없이 자동으로 공유하지 않습니다.",
    },
    /** plan §18 (12 models), §9–§16 and §19 (what to validate first); stages follow business.revenue.columns */
    models: {
      title: "모델별 방식과 먼저 검증할 것",
      fields: { name: "수익 모델", how: "수익 방식", stage: "현재 단계", check: "먼저 검증할 것" },
      items: [
        ["01", "개인·가족 구독", "고급 기록·통계·공동 관리", "개인 Premium 운영 중 · 가족 구독 제안", "유료 기능이 생겨도 기록의 기본 접근, 내보내기·삭제는 제한하지 않습니다."],
        ["02", "AI 구독", "육아·학습 AI 기능", "제안", "진단·판정이 아닌 요약·안내 범위로 한정합니다."],
        ["03", "쇼핑 수수료", "육아·가족 상품 판매", "제안", "판매자 확인, 영유아 상품 안전·표시 기준을 먼저 갖춥니다."],
        ["04", "중고거래 수수료", "안전결제를 선택한 거래", "제안", "결제·환불·분쟁 비용을 감당할 수 있는지 안전결제 원가를 먼저 검증합니다."],
        ["05", "공동구매 수수료", "공동구매 거래", "제안", "소비자 보호와 분쟁 처리 기준을 먼저 정합니다."],
        ["06", "예약 수수료", "적법한 생활·체험 서비스 예약", "제안", "이용 완료 기준으로 하며, 의료기관 환자 알선과 진료비 비례 수수료는 두지 않습니다."],
        ["07", "Books", "도서·전자책·오디오북", "장기 계획", "저작권과 앱스토어 디지털 결제 정책을 확인합니다."],
        ["08", "Toy Club", "장난감 대여·정기구독", "장기 계획", "렌털 업체 제휴로 시작해 위생·파손·회수·배송 비용을 검증합니다."],
        ["09", "Family Box", "육아·성장 물품 정기배송", "장기 계획", "판매액 전체가 이익이 아니므로 원가·배송·포장·반품·재고를 따로 계산합니다."],
        ["10", "Devices", "스마트 육아 기기", "장기 계획", "KC 인증, 카메라·위치·음성 정보의 동의·암호화·보관 기간을 확인합니다."],
        ["11", "기관 SaaS", "교육·돌봄·복지기관 도구 구독", "장기 계획", "기관 인터뷰와 파일럿으로 검증하고, 아동복지기관은 예산을 고려한 별도 지원 정책을 둡니다."],
        ["12", "기업·공공 제휴", "기업 복지·사회공헌·기관 계약", "장기 계획", "공공 조달·계약 절차와 개인정보 처리 위탁 기준을 계약에 담습니다."],
      ],
      freeTitle: "수익화하지 않는 영역",
    },
    /** plan §25 — two checks the rules list did not have yet */
    rulesExtra: [
      { name: "학교·교육 정보", lead: "학생 정보와 기관 정보, 교육 자료의 저작권을 확인하고 공식 출처와 사용 권한이 있는 정보만 연동합니다." },
      { name: "자립준비청년", lead: "보호 이력과 민감정보를 특히 엄격하게 보호하며 일반 커뮤니티나 광고 타기팅에 쓰지 않습니다." },
    ],
  },

  partnerships: {
    faq: {
      kicker: "Partner FAQ",
      title: "협력 전에 자주 묻는 질문.",
      items: [
        { q: "문의하면 파트너로 표시되나요?", a: "아니요. 계약이 확인된 기업·기관만 파트너로 표시합니다. 문의는 협력 확정이나 계약 체결을 보장하지 않습니다." },
        { q: "협력하면 아이·가족 데이터를 받을 수 있나요?", a: "아니요. 아동·가족 데이터를 판매하지 않고, 보호자 동의 없이 기록을 외부로 보내지 않습니다. 연계가 필요하면 필요한 최소 정보만, 별도 계약과 보안 검토 후에 다룹니다." },
        { q: "공개 API가 있나요?", a: "현재 외부에 공개된 API는 없습니다. 기술·API 협력은 문의를 통해 검토합니다." },
        { q: "웹사이트에서 입점하거나 판매자 계정을 만들 수 있나요?", a: "아니요. 웹사이트는 소개와 문의 연결만 제공합니다. 마켓과 입점 절차는 다음 앱 버전에서 준비 중입니다." },
        { q: "수수료와 계약 조건은 어떻게 되나요?", a: "요금과 수수료는 확정 전 제안이라 공개하지 않으며, 실제 출시·승인 후에 공개합니다. 개별 조건은 협력 범위 협의와 계약 검토 단계에서 정합니다." },
        { q: "해외 기업·기관도 문의할 수 있나요?", a: "네. 해외 협력 문의로 보내 주세요. 현재 계약한 해외 파트너는 없으며, 협력 가능성부터 함께 검토합니다." },
      ],
    },
    /** related long-term areas per partner type (area numbers from the Platform page) */
    typeAreas: {
      label: "관련 장기 영역",
      items: {
        brand: ["08 Market", "13 Family Box"],
        seller: ["08 Market"],
        creator: ["10 Books", "12 Learning"],
        expert: ["03 Growth", "07 Community", "12 Learning"],
        service: ["06 Family Trust", "09 Booking"],
        corporate: ["13 Family Box", "18 Partnerships"],
        institution: ["06 Family Trust", "17 Business", "18 Partnerships"],
        global: ["사업 모델 F", "18 Partnerships"],
      },
    },
    /** how to prepare an inquiry — paraphrased from process, types.terms, value and data principles */
    prepare: {
      title: "문의 전에 정리해 두면 좋은 것",
      items: [
        { name: "가까운 협력 유형", lead: "위의 여덟 가지 협력 유형이나 파일럿 제안 가운데 가장 가까운 것을 적어 주세요." },
        { name: "회사·기관 소개와 적격성", lead: "사업자 등록, 자격·인증, 안전 기준처럼 적합성 검토에 필요한 기본 정보입니다." },
        { name: "닿고 싶은 가족의 단계", lead: "임신·출산·영유아·학령기 가운데 협력이 도움이 될 가족의 시기입니다." },
        { name: "오가는 정보의 범위", lead: "아동·가족 정보가 오가는 협력인지, 그렇다면 필요한 최소 정보가 무엇인지 적어 주세요." },
        { name: "시작 범위와 일정", lead: "처음 시작하고 싶은 범위와 일정입니다. 작은 파일럿부터 함께 검증하는 방식을 권합니다." },
      ],
      note: "문의에 아이의 이름·사진·건강 정보 같은 개인정보는 적지 않아도 됩니다.",
    },
  },

  contact: {
    write: {
      kicker: "Before You Write",
      title: "이 내용을 함께 적어 주시면\n답변이 빨라집니다.",
      lead: "문의 목적별로 확인에 필요한 정보입니다. 꼭 필요한 내용만 적고, 아이의 개인정보는 적지 않아도 됩니다.",
      fields: { purpose: "문의 목적", what: "함께 적어 주면 좋은 내용" },
      items: [
        ["앱 기능·오류·계정", "사용하는 기기 종류(iOS·Android)와 앱 버전, 문제가 생긴 화면과 상황"],
        ["구독", "구독한 스토어(App Store·Google Play). 가격과 조건은 스토어의 앱 화면 표시를 기준으로 합니다."],
        ["계정 삭제", "먼저 계정 삭제 안내 페이지에서 방법과 처리 범위를 확인해 주세요."],
        ["기업 제휴·입점", "회사·브랜드 소개, 가까운 협력 유형, 상품 안전·표시 기준 관련 정보"],
        ["기관·공공 협력", "기관 종류, 함께 개선하고 싶은 업무(공지·일정·보호자 소통 등), 아동 정보 보호 기준"],
        ["아동 안전·복지 협력", "기관·기업의 협력 제안만 받습니다. 개인의 신고·상담은 112 등 공식 경로를 이용해 주세요."],
        ["언론·미디어", "매체명, 취재 주제, 마감 일정"],
        ["투자", "문의 목적과 연락처. 공개 가능한 범위에서 안내합니다."],
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "문의 전에 자주 묻는 질문.",
      items: [
        { q: "문의하면 협력이 확정되나요?", a: "아니요. 내용을 검토한 뒤 안내드리며, 문의가 협력이나 계약을 보장하지는 않습니다. 계약이 확인된 기업·기관만 파트너로 표시합니다." },
        { q: "실종이나 아동학대를 여기로 신고할 수 있나요?", a: "아니요. 긴급할 때는 112 등 공식 신고 경로를 먼저 이용해 주세요. BABYLOG는 신고를 접수하거나 아이의 위치·신원을 확인하지 않습니다." },
        { q: "웹사이트에서 가입·결제·예약을 할 수 있나요?", a: "아니요. 웹사이트는 BABYLOG 소개와 문의 연결만 제공합니다. 기록과 계정 관리는 BABYLOG 앱(iOS·Android)에서 이용합니다." },
        { q: "앱 계정을 삭제하고 싶어요.", a: "계정 삭제 방법과 처리 범위는 계정 삭제 안내 페이지에서 확인할 수 있습니다.", link: "delete" },
        { q: "언론·투자 문의는 어디로 보내나요?", a: "newon@newon.app으로 보내 주세요. 위의 문의 목적에서 해당 항목을 누르면 제목이 채워진 메일이 열립니다." },
        { q: "문의 내용과 개인정보는 어떻게 처리되나요?", a: "문의 내용은 NEWON 공식 문의 양식으로 전달되며, 개인정보는 개인정보처리방침에 따라 처리됩니다. BABYLOG 웹페이지에서는 개인정보를 따로 받지 않습니다." },
      ],
      deleteLink: "계정 삭제 안내 보기",
    },
  },
};

/* =========================================================================== EN */
const EN = {
  overview: {
    diffFields: { a: "Existing alternative", b: "What BABYLOG aims for", why: "What differs" },
    links: {
      label: "With BABYLOG",
      items: {
        PETLOG: "Family life with children and pets together",
        "MY WORLD": "Family trips, experiences and their memories",
        SHAREON: "Renting baby and family goods",
        LIVON: "Pregnancy, birth and family benefits, careers and life after the adult transition",
        ONGIL: "Grandparent and family care and activities across generations",
      },
    },
    limits: {
      title: "We have also decided\nwhat we will not do.",
      lead: "Because we handle children's and families' information, we decided what we will not do before building features. These are the standards written in the integrated business plan and our operating principles.",
      fields: { area: "Area", no: "What we do not do", instead: "What we do instead" },
      items: [
        ["AI", "Medical diagnosis, developmental-disability assessment, automatic face identification of missing children, selecting children for foster care or adoption", "Summarizes records for reference and gives general information."],
        ["Missing children", "Publicly posting unverified photos, personal details or locations; taking reports", "Links to official reporting routes such as 112 and to verified public notices."],
        ["Foster care and adoption", "Publishing child profiles, searching or selecting children, direct matching between individuals, adoption success fees", "Guides official schemes, procedures and responsible agencies."],
        ["Children in care and young people leaving care", "Publishing faces, real names, residence or case records; using care history in the community or for ad targeting", "Links official institution information and support schemes."],
        ["Donations", "Collecting or holding donations directly before the legal requirements and contracts are in place", "Guides people to official donation and volunteering channels."],
        ["Ads and data", "Personalized ads based on children's data; selling child or family data", "Shows information by growth-stage category."],
        ["Medical institutions", "Patient referral; fees proportional to medical charges", "Only hospital information, schedules and official booking routes."],
        ["Family records", "Keeping an adult child's records automatically visible to parents; unfairly limiting access, export or deletion of records", "Hands records to the child's own account at adulthood; the family decides the sharing scope."],
        ["Other NEWON apps", "Automatically sharing child, health or family data", "Connects only with explicit consent and lawful authority."],
      ],
    },
  },

  platform: {
    detail: {
      summary: "See the details",
      fields: { k: "Part", v: "What it covers" },
      areas: {
        "01": {
          now: "In the app today: child profiles, family sharing and hospital, education and family schedules. The other parts are planned.",
          rows: [["Family connection", "Parents, guardians and family members"], ["Child profile", "Date of birth and growth stage"], ["Shared schedule", "Hospital, school and family schedules"], ["Role permissions", "Parents, guardians and teens"], ["Shared records", "Permitted health and growth records"], ["Family alerts", "Schedules, to-dos and important notices"], ["Shared purchases", "Family goods and subscriptions"], ["Teen account", "Age-appropriate independent permissions"], ["Adult transition", "Managing one's own data and account"]],
          note: "Family connections are designed for situations that need proof of relationship or confirmation of lawful authority.",
        },
        "03": {
          now: "In the app today: height, weight and growth statistics; feeding, sleep, diaper and meal records; vaccination and health records; hospital schedules. Age-based development records and growth albums are planned.",
          rows: [["Growth", "Height, weight and growth charts"], ["Feeding", "Breast milk, formula and feeding records"], ["Sleep", "Sleep time and patterns"], ["Diapers", "Bowel movements and changes"], ["Baby food", "Menus and intake"], ["Vaccination", "Official schedule and records"], ["Hospital", "Appointments and health notes"], ["Development", "Development records by age"], ["Daily life", "Habits, schedules and activities"], ["Growth album", "Photos, videos and anniversaries"]],
          note: "Developmental assessment and medical judgment do not replace professionals, and AI is designed never to diagnose a child's condition.",
        },
        "04": {
          now: "A planned area. Hospital and education schedules can already be added in the app.",
          rows: [["School schedule", "Timetables, exams, holidays and events"], ["Study management", "Study plans, homework and progress"], ["Career exploration", "Aptitude, jobs and admissions information"], ["Learning content", "Videos, exercises and materials"], ["Academies and institutions", "Finding education institutions and reviews"], ["Counseling", "Career and education counseling schedules"], ["After school", "Programs and activities"], ["Parents", "Shared schedules and supplies"]],
          note: "Before linking official school or institution information, source, usage rights and privacy are confirmed first.",
        },
        "06": {
          now: "A planned area, designed as a trust service for comparing daycare centers, kindergartens, academies, postpartum helpers, caregivers and education institutions.",
          fields: { k: "Check", v: "How it works" },
          rows: [["Registration", "Official registration confirmed"], ["Qualifications", "Verifiable qualifications and certifications shown"], ["Real reviews", "Actual use verified"], ["Costs", "Base fees and extra costs disclosed"], ["Safety", "Reports, sanctions and dispute handling"], ["Ads", "Paid ads separated from ordinary reviews"], ["Updates", "Last-checked date shown"]],
          note: "Reviews are limited so that a child's identity, health or school life is not revealed.",
        },
        "09": {
          now: "Explore and booking are being prepared for the next app version. The website does not take bookings.",
          fields: { k: "Booking area", v: "Services" },
          rows: [["Education", "Consultations, trials and classes"], ["Care", "Lawful care services"], ["Everyday life", "Family photos, grooming and everyday services"], ["Experiences", "Family experiences and kids' programs"], ["Venues", "Kids' spaces and event venues"], ["Health", "Hospital information and official booking routes"]],
          note: "Patient referral to medical institutions and fees proportional to medical charges are never run like ordinary booking fees.",
        },
        "10": {
          now: "A planned area. Product formats and terms have not been set.",
          rows: [["Recommendations", "Picture books, storybooks, learning books, e-books and audiobooks matched to the growth stage"], ["Expansion", "Book sales, publisher partnerships, regular book deliveries and licensed content"], ["Formats", "Digital book subscription, physical book delivery and single-book sales under review"]],
          note: "Copyright and app-store digital payment rules for e-books and audiobooks are reviewed first.",
        },
        "11": {
          now: "An idea under review.",
          rows: [["Age-based picks", "Toys that fit the growth stage"], ["Rental period", "Regular delivery and return"], ["Returns and swaps", "Swapping for next-stage toys"], ["Hygiene", "Cleaning and inspection after collection"], ["Damage policy", "Rules for damage and loss"], ["Family subscription", "Subscription per family"]],
          note: "The recommended order is to start with verified toy-rental companies and expand direct operation only after hygiene, safety, delivery and loss costs are validated.",
        },
        "13": {
          now: "An idea under review, also considered as a gift subscription from relatives, corporate birth gifts and family-benefit products.",
          fields: { k: "Box", v: "What goes in" },
          rows: [["Pregnancy Box", "Pregnancy and birth preparation items"], ["Newborn Box", "Newborn daily items"], ["Baby Care Box", "Diapers and hygiene consumables"], ["Toddler Box", "Toddler play and learning items"], ["School Box", "School preparation and study items"], ["Custom Box", "A family's own selection"]],
          note: "Sales of physical deliveries are not all profit, so product, delivery, packaging, return and stock costs are calculated and validated separately.",
        },
        "14": {
          now: "An idea under review. Devices and manufacturers have not been chosen.",
          fields: { k: "Device", v: "Role" },
          rows: [["Baby Monitor", "Baby monitoring and room check"], ["Kids Tablet", "Children's learning and family features"], ["Smart Sensor", "Temperature, humidity and room environment"], ["Story Speaker", "Stories, audio content and learning"]],
          note: "Camera, location and voice features put consent, access rights, encryption, retention periods, device security and KC certification first.",
        },
        "15": {
          now: "In the app today: a reference-only AI record summary. The other AI services are planned or under review.",
          fields: { k: "AI service", v: "What it does" },
          rows: [["Pregnancy AI", "Pregnancy and birth schedule help"], ["Baby Care AI", "Parenting record summaries"], ["Growth AI", "Growth record visualization"], ["Family AI", "Family schedules and to-dos"], ["Learning AI", "Study, review and explanations"], ["School AI", "School schedules and supplies"], ["Books AI", "Age-based book suggestions"], ["Toy AI", "Play ideas by developmental stage"], ["Safety AI", "Safety information and checklists"], ["Welfare AI", "Finding official support schemes"]],
          note: "AI never performs medical diagnosis, developmental-disability assessment, automatic face identification of missing children or selection of children for adoption or foster care.",
        },
        "20": {
          now: "A planned area. Official information and emergency contact routes are planned from development stage P3.",
          fields: { k: "Feature", v: "What it covers" },
          rows: [["Safety education", "Missing-child prevention and everyday safety"], ["Guardian contacts", "Emergency contact management"], ["Going out and coming home", "Consent-based schedules and safety checks"], ["Official reporting", "Links to 112, 119 and others"], ["Protection agencies", "Official child protection agency information"], ["Safety content", "Education materials by age"], ["Institution cooperation", "Schools, welfare centers and public bodies"]],
          note: "Child location features are limited to the minimum needed for safety rather than constant monitoring, considering children's rights by age and guardian permissions.",
        },
        "25": {
          now: "A planned area. Real institution cooperation proceeds only after verified partnerships and protection systems are in place.",
          fields: { k: "Area", v: "Main services" },
          rows: [["Housing", "Independent housing and official support"], ["Education", "Scholarships, education and certificates"], ["Jobs", "Hiring, job skills and career preparation"], ["Money", "Living budgets and financial education"], ["Counseling", "Links to official counseling agencies"], ["Mentoring", "Verified mentors and institution programs"], ["Daily life", "Contracts, paperwork and daily management"], ["LIVON link", "Adult life, jobs and housing"]],
          note: "The personal data and care history of young people leaving care are especially sensitive and are never used in the general community or for ad targeting.",
        },
      },
    },
    menu: {
      title: "Proposed app menu structure",
      lead: "The five bottom tabs proposed in the integrated business plan, grouped so families keep finding things in the same place as features grow.",
      items: [
        { name: "Home", lead: "Family schedule, growth summary, today's to-dos, safety guidance" },
        { name: "Growth", lead: "Pregnancy, parenting, health, school, learning and growth records" },
        { name: "Discover", lead: "Institutions, booking, market, Books, Toy Club, welfare, safety" },
        { name: "Community", lead: "Family experiences, questions, reviews and information" },
        { name: "My", lead: "Family account, permissions, subscriptions, devices, settings" },
      ],
      note: "A proposed structure that may differ from the current app screens. Emergency child-protection features are never hidden in complex menus.",
    },
    dev: {
      title: "Development stages P0–P9",
      lead: "Separately from feature status, development is planned in the order below. Stages are an order of work, not release dates.",
      fields: { stage: "Stage", scope: "Scope", goal: "Goal" },
      items: [
        ["P0", "Preserve existing code, data, design and backups", "A safe development baseline"],
        ["P1", "Family account, pregnancy, growth, health, calendar", "Core daily features"],
        ["P2", "School, learning, career, Family Trust", "The whole growth journey"],
        ["P3", "Safety, official missing-child reporting guidance, welfare information", "A free safety foundation"],
        ["P4", "Community, institution search, booking", "Connecting users and institutions"],
        ["P5", "Shopping, used goods, group buying, Books", "Validating transaction revenue"],
        ["P6", "Toy Club, Family Box, subscriptions, AI", "Repeat use"],
        ["P7", "Education and childcare institution SaaS, smart devices", "B2B and hardware"],
        ["P8", "Foster care and adoption information, sponsorship, young people leaving care", "Official institution cooperation"],
        ["P9", "Public and corporate partnerships, global", "Long-term expansion"],
      ],
      note: "Of the public-interest features in P8, official information and emergency contacts can be offered from P3. Real institution cooperation and operation need verified partnerships and protection systems.",
    },
  },

  business: {
    tiers: {
      kicker: "Product Structure",
      title: "Products to validate,\nfor families and institutions.",
      lead: "The product structure proposed in the integrated business plan. The only product on sale today is the individual Premium subscription; the structure and prices below are unvalidated hypotheses, so they are not sold and no prices are shown.",
      familyTitle: "Individual and family plans (proposed)",
      orgTitle: "Corporate and institution plans (proposed)",
      fields: { name: "Plan", what: "What it covers" },
      family: [
        ["BABYLOG Free", "Basic growth, health and family records"],
        ["BABYLOG Plus", "Advanced statistics, records and storage"],
        ["BABYLOG Pro", "AI and advanced family management"],
        ["BABYLOG Books", "Licensed digital books"],
        ["BABYLOG Learning", "Advanced learning content"],
        ["Books Box · Toy Club", "Physical book delivery and regular toy rental"],
      ],
      org: [
        ["Business Free", "Basic institution listing"],
        ["Business Starter", "Small institutions"],
        ["Business Growth", "Many staff and programs"],
        ["Business Pro", "Advanced operations and analytics"],
        ["Enterprise", "Large companies and public bodies, separate contract"],
      ],
      note: "Family Box is priced separately by contents and delivery cost, and tools for child welfare institutions get a separate support policy that reflects their public purpose and budgets.",
    },
    roles: {
      kicker: "Across NEWON",
      title: "Keeping businesses\nfrom overlapping inside NEWON.",
      lead: "BABYLOG divides roles with the other NEWON platforms, on the principle of never selling the same service twice to the same family or charging two fees on one transaction.",
      fields: { platform: "Platform", link: "Where it meets BABYLOG", split: "Who does what" },
      items: [
        ["LIVON", "Pregnancy, birth, family, careers and the adult transition", "Life benefits such as birth grants and parental leave are guided by LIVON; the child's records and parenting are BABYLOG"],
        ["SHAREON", "Renting baby and family goods", "Shopping, used goods and group buying are the BABYLOG market; rental is SHAREON. One transaction never carries two fees."],
        ["PETLOG", "Family life with children and pets together", "Pet records and services are PETLOG"],
        ["ONGIL", "Grandparent and family care and activities across generations", "Senior life and care are ONGIL; sharing a grandchild's care records is BABYLOG family sharing"],
        ["MY WORLD", "Family trips, experiences and memories", "Travel records and travel services are MY WORLD"],
      ],
      note: "Child, health and family data are never shared automatically between apps without explicit consent and lawful authority.",
    },
    models: {
      title: "How each model works and what is validated first",
      fields: { name: "Revenue model", how: "How it earns", stage: "Stage today", check: "Validate first" },
      items: [
        ["01", "Individual and family subscription", "Advanced records, statistics and shared management", "Individual Premium operating · family plan proposed", "Even with paid features, basic access to records, export and deletion are not limited."],
        ["02", "AI subscription", "Parenting and learning AI features", "Proposal", "Kept to summaries and guidance, never diagnosis or assessment."],
        ["03", "Shopping fees", "Sales of baby and family goods", "Proposal", "Seller verification and infant product safety and labeling rules come first."],
        ["04", "Used-goods fees", "Trades that choose safe payment", "Proposal", "Safe-payment costs are validated first to see whether they cover payment, refund and dispute costs."],
        ["05", "Group-buying fees", "Group-buying transactions", "Proposal", "Consumer protection and dispute rules are set first."],
        ["06", "Booking fees", "Bookings of lawful everyday and experience services", "Proposal", "Based on completed use, with no patient referral and no fees proportional to medical charges."],
        ["07", "Books", "Books, e-books and audiobooks", "Long-term plan", "Copyright and app-store digital payment rules are checked."],
        ["08", "Toy Club", "Toy rental and subscription", "Long-term plan", "Starts with rental-company partnerships to validate hygiene, damage, collection and delivery costs."],
        ["09", "Family Box", "Regular deliveries of parenting and growth goods", "Long-term plan", "Sales are not all profit, so product, delivery, packaging, return and stock costs are calculated separately."],
        ["10", "Devices", "Smart parenting devices", "Long-term plan", "KC certification and consent, encryption and retention for camera, location and voice data are checked."],
        ["11", "Institution SaaS", "Tool subscriptions for education, care and welfare institutions", "Long-term plan", "Validated through institution interviews and pilots, with a separate support policy for child welfare institutions' budgets."],
        ["12", "Corporate and public partnerships", "Corporate benefits, social contribution and institution contracts", "Long-term plan", "Public procurement and contract procedures and data-processing outsourcing terms are written into contracts."],
      ],
      freeTitle: "Not monetized",
    },
    rulesExtra: [
      { name: "School and education information", lead: "Student and institution information and the copyright of education materials are checked, and only information with an official source and usage rights is linked." },
      { name: "Young people leaving care", lead: "Care history and sensitive data are protected especially strictly and are never used in the general community or for ad targeting." },
    ],
  },

  partnerships: {
    faq: {
      kicker: "Partner FAQ",
      title: "Common questions before partnering.",
      items: [
        { q: "Will we be listed as a partner once we inquire?", a: "No. Only companies and institutions with a confirmed contract are shown as partners. An inquiry does not guarantee cooperation or a contract." },
        { q: "Can a partner receive child or family data?", a: "No. Child and family data are never sold, and records are never sent out without guardian consent. Where a link is needed, only the minimum information is handled, under a separate contract and security review." },
        { q: "Is there a public API?", a: "There is no public API today. Technology and API cooperation is reviewed through an inquiry." },
        { q: "Can we list products or create a seller account on the website?", a: "No. The website only introduces BABYLOG and connects inquiries. The market and onboarding process are being prepared for the next app version." },
        { q: "What are the fees and contract terms?", a: "Prices and fees are unconfirmed proposals and are not published until actual launch and approval. Individual terms are set during scope discussion and contract review." },
        { q: "Can overseas companies and institutions inquire?", a: "Yes, through the global partnership inquiry. There are no contracted overseas partners today; we start by reviewing the possibility together." },
      ],
    },
    typeAreas: {
      label: "Related long-term areas",
      items: {
        brand: ["08 Market", "13 Family Box"],
        seller: ["08 Market"],
        creator: ["10 Books", "12 Learning"],
        expert: ["03 Growth", "07 Community", "12 Learning"],
        service: ["06 Family Trust", "09 Booking"],
        corporate: ["13 Family Box", "18 Partnerships"],
        institution: ["06 Family Trust", "17 Business", "18 Partnerships"],
        global: ["Business model F", "18 Partnerships"],
      },
    },
    prepare: {
      title: "Good to have ready before you write",
      items: [
        { name: "The closest partnership type", lead: "Name the closest of the eight partnership types or pilot proposals above." },
        { name: "Who you are and your eligibility", lead: "Basic information for the fit review, such as business registration, qualifications, certifications and safety standards." },
        { name: "The family stage you want to reach", lead: "Which stage — pregnancy, birth, early childhood or school age — the cooperation would help." },
        { name: "What information would be exchanged", lead: "Whether child or family information would be exchanged and, if so, the minimum information needed." },
        { name: "Starting scope and timing", lead: "The scope and timing you would like to start with. We suggest validating together through a small pilot first." },
      ],
      note: "You do not need to include personal details such as a child's name, photo or health information.",
    },
  },

  contact: {
    write: {
      kicker: "Before You Write",
      title: "Including these details\nhelps us reply sooner.",
      lead: "The information needed to check each kind of inquiry. Write only what is needed; a child's personal details are not required.",
      fields: { purpose: "Inquiry purpose", what: "Helpful to include" },
      items: [
        ["App features, errors and account", "Your device type (iOS or Android), the app version and the screen and situation where the problem happened"],
        ["Subscription", "The store you subscribed through (App Store or Google Play). Prices and terms follow the app screen in the store."],
        ["Account deletion", "Please check the method and scope on the account deletion page first."],
        ["Business partnership and listing", "Company or brand introduction, the closest partnership type and product safety and labeling information"],
        ["Institution and public cooperation", "Type of institution, the work you want to improve together (notices, schedules, guardian communication and so on) and child data protection standards"],
        ["Child safety and welfare cooperation", "Only cooperation proposals from institutions and companies are accepted. For individual reports or counseling, please use official routes such as 112."],
        ["Press and media", "Outlet name, topic and deadline"],
        ["Investment", "The purpose of the inquiry and contact details. We share what can be disclosed."],
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Common questions before you write.",
      items: [
        { q: "Does an inquiry confirm a partnership?", a: "No. We review the content and get back to you, but an inquiry does not guarantee cooperation or a contract. Only companies and institutions with a confirmed contract are shown as partners." },
        { q: "Can I report a missing child or child abuse here?", a: "No. In an emergency, please use official routes such as 112 first. BABYLOG does not take reports or confirm a child's location or identity." },
        { q: "Can I sign up, pay or book on the website?", a: "No. The website only introduces BABYLOG and connects inquiries. Records and account management are in the BABYLOG app (iOS and Android)." },
        { q: "I want to delete my app account.", a: "The method and scope of account deletion are on the account deletion page.", link: "delete" },
        { q: "Where do press and investment inquiries go?", a: "Please write to newon@newon.app. Choosing the matching purpose above opens an e-mail with the subject filled in." },
        { q: "How are my inquiry and personal data handled?", a: "Inquiries go through NEWON's official inquiry form, and personal data is handled under the privacy policy. The BABYLOG web pages do not collect personal data separately." },
      ],
      deleteLink: "See account deletion",
    },
  },
};

export function getContentV3(lang) {
  return lang === "ko" ? KO : EN;
}
