/**
 * BABYLOG corporate website — design pass v6 content (2026-10-27).
 *
 * Owner request: "BABYLOG 모든 화면 디자인 다양하게 내용 자세하게 다시 해줘". Detail the site did not show yet, taken
 * from the integrated business plan ("BABYLOG 최종 통합 사업계획서", 2026-10-20) or restating existing site copy:
 *   - who manages the record at each growth stage (plan §3, §4) and the middle/high-school split (plan §3)
 *   - the inclusive scope of the public-welfare area (plan §1)
 *   - detail rows for the 15 long-term areas that had none (plan §2, §5, §7, §9, §16, §19–§26, §22; area leads)
 *   - the order in which partnership kinds open, following the development stages P4–P9 (plan §24, §11–§14, §20–§26)
 *   - labels for the illustrative app screens (existing copy only)
 * Rewritten for visitors; NOT reviewed by the owner. ko = primary, en = draft.
 * Public / private rule (qa-babylog-site.mjs): no price, fee rate, revenue or user figure. Future items stay plans.
 */

/* =========================================================================== KO */
const KO = {
  overview: {
    journey: {
      manageLabel: "기록 관리",
      focusLabel: "이 시기에 챙기는 것",
      stages: {
        s1: { status: "now", manage: "임신부와 가족이 함께 기록합니다." },
        s2: { status: "now", manage: "부모·조부모·보호자가 같은 기록을 함께 보고 이어서 남깁니다." },
        s3: { status: "now", manage: "가족이 함께 기록하고, 누가 무엇을 볼지는 가족이 정합니다." },
        s4: { status: "plan", manage: "부모·보호자가 학교 일정과 준비물을 함께 관리하는 구조로 계획합니다.", focus: "학교 일정·학습·방과 후와 함께 친구 관계와 생활 안전을 살피는 시기입니다." },
        s5: { status: "plan", manage: "청소년 계정으로 스스로 관리하는 범위를 넓히고, 청소년의 사생활을 보호합니다.", focus: "중학생은 학습·진로·학교생활·건강·생활 관리, 고등학생은 입시·진학·자격증·졸업 준비가 중심입니다." },
        s6: { status: "plan", manage: "성인이 된 자녀가 본인 계정으로 기록을 넘겨받습니다. 부모에게 자동으로 계속 공개되지 않습니다." },
      },
    },
    impactScope: "부모가 없는 아동, 보호가 필요한 아동, 위탁가정, 아동복지시설, 자립을 준비하는 청년까지 포함하는 서비스로 넓혀 가되, 아동 보호와 실종·입양·위탁 관련 기능은 일반 상업 마켓과 분명히 분리합니다.",
    familyMock: { title: "가족 공유", label: "누가 무엇을 볼지 가족이 정합니다" },
  },

  platform: {
    showcase: {
      kicker: "Inside the App",
      title: "매일 여는 화면,\n이렇게 구성합니다.",
      lead: "지금 앱에서 쓰는 기능과 제안된 메뉴 구조를 바탕으로 만든 예시 화면입니다. 실제 앱 화면과 다를 수 있습니다.",
      screens: { today: "오늘", records: "성장 기록", family: "가족 공유" },
    },
    areaSummary: "세부 구성",
    areas: {
      "02": {
        now: "지금 앱에서는 임신 주차와 검진 일정을 관리합니다. 나머지 구성은 계획입니다.",
        rows: [["임신 준비", "준비 정보와 가족 계획"], ["주차별 기록", "임신 주차별 변화"], ["검진 일정", "병원 검진 일정"], ["출산 준비", "출산 준비물"], ["산후 회복", "산후 생활 정보"], ["지원 제도", "정부 지원 제도 안내"], ["가족 일정", "가족이 함께 보는 일정"]],
        note: "생애 이벤트 전반의 제도 안내는 LIVON이 맡고, BABYLOG는 임신·출산에서 이후의 육아까지 깊이 있게 잇습니다.",
      },
      "05": {
        now: "향후 계획 영역입니다.",
        rows: [["사진·영상", "성장 앨범"], ["주요 순간", "첫걸음·첫말·입학·졸업"], ["가족 앨범", "가족이 함께 보는 공동 앨범"], ["성장 타임라인", "기록과 기념일을 시간순으로"], ["포토북", "포토북 제작 검토"]],
        note: "고급 저장 공간이나 포토북 같은 유료 기능을 검토하더라도 기록의 기본 접근과 내보내기·삭제는 부당하게 제한하지 않습니다.",
      },
      "07": {
        now: "부모 커뮤니티는 다음 앱 버전에서 준비 중입니다.",
        rows: [["경험 나눔", "비슷한 성장 단계 가족의 경험"], ["질문", "육아 질문과 답변"], ["후기·정보", "가족 경험과 정보 공유"], ["운영 정책", "아동 사진·개인정보 보호, 잘못된 건강 정보와 광고성 게시물 대응"]],
        note: "운영 정책을 먼저 갖춘 뒤 커뮤니티를 엽니다.",
      },
      "08": {
        now: "마켓(육아용품 쇼핑·중고·공동구매)은 다음 앱 버전에서 준비 중입니다.",
        rows: [["육아용품 쇼핑", "기저귀·분유·의류·생활용품"], ["중고 거래", "성장 단계별 물품 거래"], ["공동구매", "가족·육아 물품 공동구매"], ["판매자 확인", "판매를 열기 전 판매자 확인"], ["결제·정산", "NEWON 공통 거래 인프라 활용 계획"]],
        note: "SHAREON은 공유·대여 전문 플랫폼이므로 BABYLOG의 쇼핑·중고 거래를 SHAREON 대여로 옮기지 않습니다.",
      },
      "12": {
        now: "향후 계획 영역입니다.",
        rows: [["연령별 자료", "놀이·학습 자료"], ["교육 콘텐츠", "영상·문제·학습 자료"], ["학습 서비스", "고급 학습 콘텐츠(구독 제안)"], ["확인 기준", "저작권·이용 범위·연령 적합성"]],
        note: "콘텐츠 제공자의 저작권과 이용 범위를 확인한 콘텐츠만 연결합니다.",
      },
      "16": {
        now: "향후 계획 영역입니다.",
        rows: [["생활 안전", "가정 생활 안전 체크리스트"], ["긴급 연락처", "보호자 긴급 연락처"], ["공식 신고", "112·119 같은 공식 신고 경로 안내"], ["노출 원칙", "긴급 기능을 복잡한 메뉴에 숨기지 않음"]],
        note: "16 Safety는 일반 가정의 안전 기능이고, 20 Safety Network는 아동 보호 체계·교육·공식 기관 협력을 다룹니다.",
      },
      "17": {
        now: "향후 계획 영역입니다. 기관 인터뷰와 파일럿으로 먼저 검증합니다.",
        rows: [["공지", "기관 공지"], ["일정", "기관 일정"], ["보호자 소통", "보호자와의 소통"], ["운영", "기관 운영 관리"], ["접근 권한", "아동·보호자 정보 접근 권한을 먼저 설계"]],
        note: "고객별 외주 개발이 아닌 공통 제품으로 만들며, 기관별 접근 권한과 개인정보 처리 위탁 기준을 계약에 담습니다.",
      },
      "18": {
        now: "향후 계획 영역입니다. 협력 문의는 지금도 받습니다.",
        rows: [["기업 가족복지", "임직원 가족을 위한 복지"], ["브랜드 캠페인", "육아 브랜드 캠페인"], ["공공 협력", "공공기관 협력"], ["공개 기준", "계약이 확인된 곳만 파트너로 공개"]],
        note: "협력은 표준화된 방식과 계약으로 운영합니다.",
      },
      "19": {
        now: "향후 계획 영역입니다. 112 신고와 공식 기관 연결은 무료입니다.",
        rows: [["예방 정보", "실종 아동 예방 정보"], ["공식 신고", "112와 공식 실종아동 기관으로 가는 경로"], ["공공기관 공지", "확인된 공공기관 공지 연결"], ["긴급 연락", "긴급 연락 기능"]],
        note: "검증되지 않은 실종 아동 사진·신상·위치의 공개 게시와 AI 임의 얼굴 매칭은 도입하지 않습니다.",
      },
      "21": {
        now: "향후 계획 영역입니다.",
        rows: [["공식 기관 정보", "아동양육시설·공동생활가정·아동 보호기관·지역아동센터"], ["필요 물품", "검증된 기관의 후원 필요 물품"], ["자원봉사", "기관 자원봉사"], ["프로그램", "교육 프로그램과 협력 요청"]],
        note: "보호 아동의 얼굴·실명·시설 거주 정보·사례 기록은 공개하지 않습니다.",
      },
      "22": {
        now: "향후 계획 영역입니다.",
        rows: [["제도 안내", "공식 가정위탁 제도"], ["신청 자격", "자격과 절차"], ["교육·지원", "교육과 지원 제도"], ["담당 기관", "담당 기관 연결"]],
        note: "아동과 위탁가정을 개인 간에 직접 매칭하지 않으며, 위탁 결정은 법적 권한이 있는 기관과 절차로 이루어집니다.",
      },
      "23": {
        now: "향후 계획 영역입니다.",
        rows: [["입양 절차", "공식 입양 절차"], ["상담 기관", "공식 상담 기관"], ["자격·서류", "입양 자격과 서류"], ["교육", "입양 전 교육"], ["입양 후 지원", "입양 후 지원 정보"]],
        note: "아동 프로필 공개, 입양 대상 아동 검색·선택, 직접 매칭, 입양 성사 수수료는 운영하지 않습니다.",
      },
      "24": {
        now: "검토 단계의 구상입니다.",
        rows: [["물품 후원", "공식 기관의 필요 물품 연결"], ["자원봉사", "검증된 봉사 프로그램 탐색"], ["기부 경로", "공식 기부·봉사 채널로 연결"]],
        note: "법적 요건과 계약을 갖추기 전까지 BABYLOG가 기부금을 직접 모금·보관하지 않습니다.",
      },
      "26": {
        now: "검토 단계의 구상입니다.",
        rows: [["일정·프로그램", "기관 일정과 프로그램 운영"], ["물품 수요", "필요 물품 관리"], ["봉사 운영", "자원봉사 운영"], ["후원 관리", "후원 관리"], ["기관 보고", "기관 보고 도구"], ["CSR 연결", "기업 사회공헌 연결"]],
        note: "개별 보호 아동의 민감한 사례 정보나 신원을 상업적으로 거래하지 않으며, 실종 신고·보호·위탁·입양 안내 자체는 무료로 유지합니다.",
      },
      "27": {
        now: "향후 계획입니다. 지금은 기부를 받지 않습니다.",
        rows: [["지원 대상", "저소득·위기 가정 아동, 보호대상 아동·자립준비청년"], ["지원 분야", "식사·생필품, 교육비·학습용품, 의료·건강·재활"], ["협력", "아동복지기관·비영리단체, 아동복지시설·그룹홈"], ["결과 안내", "지원 결과를 안내하는 방향"]],
        note: "수익 사업으로 운영하지 않으며, 아동의 이름·사진·사연 같은 개인정보와 신원은 공개하지 않습니다.",
      },
    },
  },

  partnerships: {
    order: {
      kicker: "When Partnerships Open",
      title: "협력이 열리는 순서도\n개발 단계를 따릅니다.",
      lead: "어떤 협력이 언제 필요해지는지 개발 단계 P4–P9에 맞춰 정리했습니다. 단계는 추진 순서이며 출시일이나 계약 일정이 아닙니다.",
      items: [
        { n: "P4", name: "커뮤니티·기관 탐색·예약", body: "키즈 클래스·가족 촬영·키즈카페 같은 생활 서비스 업체와 교육·돌봄 기관 정보 협력이 필요해지는 단계입니다." },
        { n: "P5", name: "쇼핑·중고·공동구매·Books", body: "육아 브랜드·판매자의 입점과 출판사 제휴를 검토합니다. 판매자 확인과 영유아 상품 안전 기준이 먼저입니다." },
        { n: "P6", name: "Toy Club·Family Box·구독", body: "검증된 장난감 렌털 업체와의 제휴로 시작하고, 기업 출산 축하 선물·가족 복지 상품으로서의 Family Box를 검토합니다." },
        { n: "P7", name: "기관 SaaS·스마트 기기", body: "어린이집·유치원·학원과의 기관 도구 파일럿, KC 인증과 보안 기준을 갖춘 기기 제조사와의 연동을 검토합니다." },
        { n: "P8", name: "위탁·입양 정보·후원·자립", body: "공식 기관·아동복지시설·비영리단체와의 협력 단계입니다. 공식 정보 안내와 긴급 연락은 P3부터 제공할 수 있습니다." },
        { n: "P9", name: "공공·기업 제휴·글로벌", body: "공공 계약, 기업 가족복지·사회공헌, 해외 기업·기관과의 협력 가능성을 검토합니다." },
      ],
      note: "실제 기관 연계와 운영은 검증된 파트너십과 아동 보호 체계를 갖춘 뒤 진행합니다.",
    },
  },
};

/* =========================================================================== EN */
const EN = {
  overview: {
    journey: {
      manageLabel: "Who keeps the record",
      focusLabel: "What this stage is about",
      stages: {
        s1: { status: "now", manage: "The expectant parent and family record together." },
        s2: { status: "now", manage: "Parents, grandparents and caregivers see the same record and add to it." },
        s3: { status: "now", manage: "The family records together and decides who sees what." },
        s4: { status: "plan", manage: "Planned so parents and caregivers manage school schedules and supplies together.", focus: "Alongside school schedules, learning and after-school activities, friendships and everyday safety matter." },
        s5: { status: "plan", manage: "A teen account widens what young people manage themselves and protects their privacy.", focus: "Middle school centres on learning, careers, school life, health and daily routines; high school on admissions, certificates and graduation." },
        s6: { status: "plan", manage: "The adult child takes the record over in their own account. It is not kept automatically visible to parents." },
      },
    },
    impactScope: "The service widens to include children without parents, children who need protection, foster families, child welfare facilities and young people preparing to live independently, while child protection, missing-child, adoption and foster care functions stay clearly separate from the commercial marketplace.",
    familyMock: { title: "Family sharing", label: "The family decides who sees what" },
  },

  platform: {
    showcase: {
      kicker: "Inside the App",
      title: "The screens a family\nopens every day.",
      lead: "Illustrative screens built from the features in today's app and the proposed menu structure. The actual app may look different.",
      screens: { today: "Today", records: "Growth records", family: "Family sharing" },
    },
    areaSummary: "What it covers",
    areas: {
      "02": {
        now: "Today's app manages pregnancy weeks and check-up schedules. The rest is planned.",
        rows: [["Preparing for pregnancy", "Preparation information and family planning"], ["Weekly records", "Changes week by week"], ["Check-ups", "Hospital check-up schedule"], ["Birth preparation", "What to prepare for the birth"], ["Postpartum recovery", "Postpartum life information"], ["Support programs", "Government support programs"], ["Family schedule", "A schedule the family shares"]],
        note: "LIVON covers programs across life events; BABYLOG connects pregnancy and birth in depth to the parenting that follows.",
      },
      "05": {
        now: "A planned area.",
        rows: [["Photos and video", "Growth album"], ["Key moments", "First steps, first words, starting and finishing school"], ["Family album", "A shared family album"], ["Growth timeline", "Records and milestones in order"], ["Photo books", "Photo book printing under review"]],
        note: "Even if paid features such as extra storage or photo books are reviewed, basic access to the record and its export or deletion are not unfairly restricted.",
      },
      "07": {
        now: "The parent community is being prepared for the next app version.",
        rows: [["Shared experience", "Families at a similar growth stage"], ["Questions", "Parenting questions and answers"], ["Reviews and tips", "Sharing family experience and information"], ["Operating policy", "Protecting children's photos and personal data, handling wrong health information and promotional posts"]],
        note: "The community opens once its operating policy is in place.",
      },
      "08": {
        now: "The marketplace (baby goods shopping, second-hand, group buying) is being prepared for the next app version.",
        rows: [["Baby goods shopping", "Nappies, formula, clothing, household goods"], ["Second-hand", "Items traded by growth stage"], ["Group buying", "Family and baby goods bought together"], ["Seller checks", "Sellers are checked before selling opens"], ["Payments and settlement", "Planned on NEWON's shared transaction infrastructure"]],
        note: "SHAREON is the platform for sharing and rental, so BABYLOG's shopping and second-hand trades are not moved into SHAREON rental.",
      },
      "12": {
        now: "A planned area.",
        rows: [["Age-based material", "Play and learning material"], ["Education content", "Videos, exercises, learning material"], ["Learning service", "Advanced learning content (subscription proposed)"], ["Checks", "Copyright, scope of use, age suitability"]],
        note: "Only content whose copyright and scope of use have been confirmed is connected.",
      },
      "16": {
        now: "A planned area.",
        rows: [["Home safety", "A home safety checklist"], ["Emergency contacts", "Guardians' emergency contacts"], ["Official reporting", "Official routes such as 112 and 119"], ["Visibility", "Emergency functions are never hidden in complex menus"]],
        note: "16 Safety is the home safety function; 20 Safety Network covers child protection, education and work with official bodies.",
      },
      "17": {
        now: "A planned area, validated first through interviews and pilots with institutions.",
        rows: [["Notices", "Institution notices"], ["Schedules", "Institution schedules"], ["Guardian communication", "Communicating with guardians"], ["Operations", "Running the institution"], ["Access rights", "Access to child and guardian data designed first"]],
        note: "Built as one shared product rather than custom work per client; access rights and data-processing rules per institution go into the contract.",
      },
      "18": {
        now: "A planned area. Partnership inquiries are welcome now.",
        rows: [["Corporate family benefits", "Benefits for employees' families"], ["Brand campaigns", "Parenting brand campaigns"], ["Public cooperation", "Work with public institutions"], ["Disclosure", "Only contract-confirmed organisations are shown as partners"]],
        note: "Partnerships run on standardised terms and contracts.",
      },
      "19": {
        now: "A planned area. Reporting to 112 and connection to official bodies are free.",
        rows: [["Prevention", "Missing-child prevention information"], ["Official reporting", "Routes to 112 and the official missing-child bodies"], ["Public notices", "Links to confirmed public-agency notices"], ["Emergency contact", "An emergency contact function"]],
        note: "Public posting of unverified photos, identities or locations of missing children and arbitrary AI face matching will not be introduced.",
      },
      "21": {
        now: "A planned area.",
        rows: [["Official facility information", "Child care facilities, group homes, child protection agencies, local children's centres"], ["Needed goods", "Goods that verified institutions need"], ["Volunteering", "Volunteering at institutions"], ["Programs", "Education programs and cooperation requests"]],
        note: "Faces, names, residence details and case records of children in care are never published.",
      },
      "22": {
        now: "A planned area.",
        rows: [["The program", "The official foster care program"], ["Eligibility", "Eligibility and procedure"], ["Training and support", "Training and support programs"], ["Responsible bodies", "Connection to the responsible agency"]],
        note: "Children and foster families are never matched person to person; placement decisions go through legally authorised agencies and procedures.",
      },
      "23": {
        now: "A planned area.",
        rows: [["Procedure", "The official adoption procedure"], ["Counselling", "Official counselling agencies"], ["Eligibility and documents", "Eligibility and required documents"], ["Training", "Pre-adoption training"], ["After adoption", "Post-adoption support information"]],
        note: "No child profiles, no searching for or choosing children, no direct matching and no success fees.",
      },
      "24": {
        now: "An idea under review.",
        rows: [["Goods donations", "Goods that official institutions need"], ["Volunteering", "Verified volunteer programs"], ["Giving routes", "Official giving and volunteering channels"]],
        note: "Until legal requirements and contracts are in place, BABYLOG does not collect or hold donations itself.",
      },
      "26": {
        now: "An idea under review.",
        rows: [["Schedules and programs", "Institution schedules and programs"], ["Needed goods", "Managing needed goods"], ["Volunteering", "Running volunteering"], ["Sponsorship", "Managing sponsorship"], ["Reporting", "Institution reporting tools"], ["CSR", "Links to corporate social contribution"]],
        note: "Sensitive case information or identities of individual children in care are never traded; missing-child reporting, protection, foster care and adoption guidance stay free.",
      },
      "27": {
        now: "A future plan. No donations are accepted today.",
        rows: [["Who it supports", "Children from low-income or at-risk families, children in care, young people leaving care"], ["Areas", "Meals and necessities, education costs and supplies, medical care, health and rehabilitation"], ["Cooperation", "Child welfare agencies and non-profits, child welfare facilities and group homes"], ["Results", "Reporting what support achieved"]],
        note: "Not run as a revenue business; children's names, photos, stories and identities are never published.",
      },
    },
  },

  partnerships: {
    order: {
      kicker: "When Partnerships Open",
      title: "Partnerships open\nin development order.",
      lead: "Which partnerships are needed when, mapped to development stages P4–P9. The stages are an order of work, not launch dates or contract schedules.",
      items: [
        { n: "P4", name: "Community, institution search, booking", body: "The stage that needs life-service businesses such as kids' classes, family photo studios and kids cafes, and information from education and care institutions." },
        { n: "P5", name: "Shopping, second-hand, group buying, Books", body: "Brand and seller onboarding and publisher partnerships are reviewed. Seller checks and safety standards for infant products come first." },
        { n: "P6", name: "Toy Club, Family Box, subscriptions", body: "Starts with verified toy rental companies; Family Box is reviewed as a corporate birth gift and family benefit." },
        { n: "P7", name: "Institution SaaS, smart devices", body: "Pilots of institution tools with daycare centres, kindergartens and academies; links with device makers that meet KC certification and security standards." },
        { n: "P8", name: "Foster care, adoption, giving, independence", body: "Cooperation with official agencies, child welfare facilities and non-profits. Official information and emergency contacts can be offered from P3." },
        { n: "P9", name: "Public and corporate partnerships, global", body: "Public contracts, corporate family benefits and social contribution, and the possibility of work with overseas companies and institutions." },
      ],
      note: "Actual links with institutions and their operation follow only once verified partnerships and child protection safeguards are in place.",
    },
  },
};

export function getContentV6(lang) {
  return lang === "ko" ? KO : EN;
}
