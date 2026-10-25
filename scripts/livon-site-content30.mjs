/**
 * LIVON corporate site — 2026-10 content upgrade (KO + EN; other languages fall back to EN like the rest of the LIVON copy).
 * Source: LIVON 최종 통합 사업계획서 (2026-10-20, 21 core areas, 12 revenue models) and the NEWON IR summary (2026-10-21).
 *
 * Rules kept here (checked by tests/livon-site/livon-site.test.mjs):
 *  - The 21 areas are the long-term business plan, NOT shipped features. Status is shown once per page by grouping
 *    (status board / group labels), never as a badge repeated on every card.
 *  - "now" only where the LIVON web service really has it today (Life Stage, Today Feed, My Life on-device, official
 *    portal guide, topic guides mapped in livon-site-data.mjs → livon/life-topics.json). Everything else is planned/review.
 *  - No prices, fee rates, revenue figures, user numbers or fundraising targets. Proposed plans are labelled as proposals.
 *  - No signed partners, pilots or APIs are claimed. Partnerships and PoCs are proposals.
 *  - Finance, insurance, legal, real-estate and medical: information and official channels only.
 */

/* ───────── 21 core areas (plan §2–4). st: now = guides / basic tools partly in LIVON web today,
   partial = only related guides or official-portal links, planned = not provided yet. cats = related 40 content categories. ───────── */
const A = (n, en, st, cats, ko, enx) => ({ n, en, st, cats, ko, enx });
export const AREAS = [
  A("01", "Life Dashboard", "now", [],
    { name: "라이프 대시보드", who: "일정과 마감이 여러 곳에 흩어져 있는 누구나", problem: "지원금 신청 기한, 검진, 시험, 계약 만료일이 캘린더·메모·문자에 나뉘어 있어 놓치기 쉽습니다.", features: ["일정·할 일", "목표", "저장한 제도·신청 기한", "건강·시험 일정", "계약 만료일", "개인 기록"], connect: "21개 영역의 일정과 저장 항목이 모이는 홈 화면입니다.", now: "My Life의 할 일·일정·루틴·기록·저장 기능을 앱 출시에 맞춰 준비하고 있습니다.", plan: "영역별 마감 알림, 목표 진행률, 원하는 사람만 쓰는 계정 기반 저장." },
    { name: "Life Dashboard", who: "Anyone whose dates and deadlines are scattered", problem: "Benefit deadlines, check-ups, exams and contract end dates sit in different calendars, notes and messages — easy to miss.", features: ["Plans and to-dos", "Goals", "Saved schemes and deadlines", "Health and exam dates", "Contract end dates", "Personal notes"], connect: "The home screen where dates and saved items from all 21 areas meet.", now: "My Life to-dos, plans, routines, notes and saved items are being prepared for the app launch.", plan: "Deadline reminders by area, goal progress, and optional account-based saving." }),
  A("02", "Life Stage", "now", ["01", "05", "39"],
    { name: "생애 단계", who: "청소년·대학생·사회초년생·직장인·결혼·출산·중장년·은퇴 단계의 누구나", problem: "나이와 상황에 따라 필요한 정보가 달라지는데, 지금 무엇부터 봐야 하는지 알기 어렵습니다.", features: ["7개 생애 단계", "단계별 대표 주제", "체크리스트", "인생 전환점 안내", "직접 고른 관심사 우선"], connect: "21개 영역 전체로 들어가는 출발점입니다.", now: "10대부터 70대 이상까지 7개 단계의 주제·가이드·체크리스트를 앱 출시에 맞춰 준비하고 있습니다.", plan: "직접 고른 상황·목표를 기준으로 한 추천. 나이만으로 사용자의 상황을 추측하지 않습니다." },
    { name: "Life Stage", who: "Anyone, from teens and students to new workers, parents, mid-life and retirement", problem: "What you need changes with age and circumstance, and it is hard to know where to start.", features: ["Seven life stages", "Key topics per stage", "Checklists", "Turning points", "Your own choices first"], connect: "The entry point into all 21 areas.", now: "Topics, guides and checklists for seven stages, from the teens to 70+, are being prepared for the app launch.", plan: "Suggestions based on the situation and goals you choose — never guessed from age alone." }),
  A("03", "Finance", "now", ["17", "18", "19", "20", "21", "22"],
    { name: "금융·경제·자산", who: "첫 월급을 받은 사회초년생부터 가계를 꾸리는 가족, 노후를 준비하는 사람까지", problem: "예산·저축·부채·구독·세금 일정이 여러 앱과 서류에 흩어져 있고, 금융 정보는 판매 목적의 광고와 섞여 있습니다.", features: ["가계부·예산", "저축 목표", "자산·부채 기록", "구독·정기결제 관리", "세금 일정", "금융 교육", "정책 금융 탐색", "보험 가입·갱신 기록"], connect: "주거·커리어·은퇴 영역, 금융감독원 '파인' 등 공식 정보와 이어집니다.", now: "경제·금융 기초, 저축·자산관리, 투자 기초 가이드를 앱 출시에 맞춰 일부 준비하고 있고, 대출·보험·세금은 공식 포털 안내 중심입니다.", plan: "사용자가 직접 입력하는 재무 기록 도구. 금융상품 판매·투자자문·대출 모집은 하지 않으며, 확장하려면 별도 규제 검토가 먼저입니다." },
    { name: "Finance", who: "From a first salary to running a household and preparing for retirement", problem: "Budgets, savings, debts, subscriptions and tax dates are spread across apps and papers, and money information is mixed with sales ads.", features: ["Household budget", "Saving goals", "Assets and debts", "Subscriptions and renewals", "Tax dates", "Financial literacy", "Public lending schemes", "Insurance renewal records"], connect: "Linked to housing, career and retirement, and to official sources such as the FSS 'FINE' portal.", now: "Guides on money basics, saving and investing basics are partly being prepared for the app launch; loans, insurance and tax point mainly to official portals.", plan: "Self-entered money records. No product sales, investment advice or loan solicitation; any expansion needs regulatory review first." }),
  A("04", "Housing", "now", ["23", "24"],
    { name: "주거·독립·이사", who: "첫 독립, 이사, 신혼집, 주택 구매를 준비하는 사람", problem: "전월세 계약, 보증금 보호, 전입신고, 공과금 설정까지 순서와 확인할 것이 많습니다.", features: ["전월세·매매 정보", "청년 주거 지원 탐색", "이사 계획", "보증금·월세 예산", "계약 체크리스트", "청소·수리·가구 서비스 연결"], connect: "법률·금융·복지 영역과 이어지고, 필요한 물건 대여는 SHAREON으로 안내합니다.", now: "부동산·주택, 이사·독립 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다.", plan: "이사 일정·체크리스트 저장, 검증된 생활 서비스 연결. 부동산 중개는 자격과 법적 요건을 확인하기 전까지 직접 운영하지 않습니다." },
    { name: "Housing", who: "People moving out, moving home, setting up as newlyweds or buying", problem: "Leases, deposit protection, moving-in registration and utilities come with many steps and checks.", features: ["Renting and buying", "Youth housing support", "Moving plans", "Deposit and rent budget", "Contract checklist", "Cleaning, repair and furniture services"], connect: "Linked to legal, finance and welfare; renting the things you need points to SHAREON.", now: "Guides on housing and moving out are partly being prepared for the app launch.", plan: "Saved moving plans and checklists, and links to checked living services. No property brokerage unless licensing and legal requirements are confirmed." }),
  A("05", "Career", "now", ["05", "06", "07"],
    { name: "취업·이직·창업", who: "구직자, 이직을 고민하는 직장인, 프리랜서와 예비 창업자", problem: "채용 정보, 지원 일정, 이력서, 창업 지원사업이 각기 다른 사이트에 있습니다.", features: ["채용 탐색", "지원 일정", "이력서·자기소개서", "AI 면접 연습", "경력 기록", "이직 계획", "프리랜서 업무 관리", "창업 지원사업 탐색"], connect: "교육·자격증·병역(전역 후 취업) 영역, 고용24·K-Startup 같은 공식 정보와 이어집니다.", now: "취업·이직, 직장·노동, 창업·사업 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다.", plan: "지원 일정·경력 기록 도구와 AI 면접 연습. 기업용 채용·교육 도구는 장기 검토 대상입니다." },
    { name: "Career", who: "Job seekers, people changing jobs, freelancers and founders", problem: "Openings, application dates, CVs and startup programmes all live on different sites.", features: ["Job search", "Application dates", "CVs and cover letters", "AI interview practice", "Career records", "Planning a move", "Freelance work", "Startup programmes"], connect: "Linked to education, certification and military service (work after discharge), and to official services such as Work24 and K-Startup.", now: "Guides on jobs, working life and starting a business are partly being prepared for the app launch.", plan: "Application and career records, AI interview practice. Enterprise hiring and training tools are a long-term option." }),
  A("06", "Education", "now", ["01", "02", "04", "08"],
    { name: "학교·학습·진로", who: "학생·수험생·학부모, 다시 배우려는 성인", problem: "학교 일정, 입시, 장학금, 강의 정보가 흩어져 있어 시기를 놓치기 쉽습니다.", features: ["학교 일정·과제", "학습 계획", "진로 탐색", "장학금", "학원·강의 탐색", "교육 자료", "AI 학습 도우미", "학습 기록"], connect: "자격증·커리어 영역, 한국장학재단과 평생학습 공공 정보와 이어집니다.", now: "학교·교육, 대학·전공, 직업훈련·평생교육 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다. 어학·유학은 계획입니다.", plan: "학습 계획·기록과 AI 학습 도우미." },
    { name: "Education", who: "Students, applicants, parents and adults returning to learning", problem: "School calendars, admissions, scholarships and courses are scattered, so deadlines slip.", features: ["School dates and assignments", "Study plans", "Career exploration", "Scholarships", "Courses and academies", "Learning materials", "AI study helper", "Study records"], connect: "Linked to certification and career, and to public scholarship and lifelong-learning information.", now: "Guides on school, university and vocational training are partly being prepared for the app launch; languages and study abroad are planned.", plan: "Study plans and records, and an AI study helper." }),
  A("07", "Health", "now", ["33", "34", "35"],
    { name: "건강·검진·생활 습관", who: "검진·복약·운동 습관을 챙기려는 누구나", problem: "검진 시기와 복약·병원 일정을 기억에 의존하게 됩니다.", features: ["건강 수치·증상 기록", "수면·운동·식사", "복약 일정", "검진·병원 일정", "개인 건강 기록", "공식 의료기관 정보"], connect: "임신·출산, 은퇴 영역과 이어지고, 어르신 돌봄은 ONGIL로 안내합니다.", now: "건강·의료생활, 운동·영양 가이드를 앱 출시에 맞춰 일부 준비하고 있고, 마음 건강은 공공 상담기관 안내 중심입니다.", plan: "기록·일정 도구. AI가 진단이나 처방을 대신하지 않으며, 건강 정보는 민감정보로 보고 최소한만 다룹니다." },
    { name: "Health", who: "Anyone keeping up with check-ups, medication or exercise", problem: "Check-up timing, medication and appointments depend on memory.", features: ["Health readings and symptoms", "Sleep, exercise, meals", "Medication schedule", "Check-ups and appointments", "Personal health records", "Official medical information"], connect: "Linked to pregnancy and retirement; care for older adults points to ONGIL.", now: "Guides on health and exercise are partly being prepared for the app launch; mental wellbeing points mainly to public counselling.", plan: "Records and schedules. AI never diagnoses or prescribes, and health data is treated as sensitive and kept to a minimum." }),
  A("08", "Welfare", "now", ["38"],
    { name: "복지·지원금·공공 서비스", who: "청년·가족·장애인·중장년·어르신 등 지원 제도가 필요한 사람", problem: "받을 수 있는 지원을 몰라서, 또는 신청 기한을 놓쳐서 받지 못하는 일이 생깁니다.", features: ["정부·지자체 지원금", "청년·가족 지원", "주거·취업 지원", "장애인·중장년·노인 복지", "신청 일정", "공식 신청 경로"], connect: "모든 생애 이벤트와 이어지며 복지로·정부24·온통청년 등 공식 포털로 연결합니다.", now: "복지·정부지원 가이드와 17개 공식 포털 안내(확인 기준일 표시)를 앱 출시에 맞춰 준비하고 있습니다.", plan: "저장한 제도의 신청 기한 알림. 공공 지원금 안내와 공식 신청 연결은 계속 무료이며, 대리 신청은 하지 않습니다." },
    { name: "Welfare", who: "Young people, families, people with disabilities, mid-life and older adults", problem: "People miss support because they do not know it exists or miss the deadline.", features: ["National and local benefits", "Youth and family support", "Housing and job support", "Disability and senior welfare", "Application dates", "Official application routes"], connect: "Touches every life event and links to official portals such as Bokjiro, Gov24 and Youth Center.", now: "Welfare guides and 17 official portals, each with the date it was checked, are being prepared for the app launch.", plan: "Deadline reminders for saved schemes. Benefit information and official links stay free; LIVON never applies on anyone's behalf." }),
  A("09", "Legal", "partial", ["14", "15"],
    { name: "법률·계약·행정", who: "계약·민원·서류 절차를 앞둔 사람", problem: "임대차·근로·소비자 계약에서 확인할 점을 몰라 분쟁으로 이어지기도 합니다.", features: ["계약 체크리스트", "서류 보관", "행정 일정", "민원 안내", "생활 법률 정보", "공식 기관 연결", "적법한 전문가 상담 탐색"], connect: "주거·커리어·가족 영역, 대한법률구조공단·정부24 같은 공공기관과 이어집니다.", now: "민원·행정, 법률·권리는 관련 서비스 안내와 공식 포털 연결을 일부 준비하고 있습니다.", plan: "계약 체크리스트와 서류 보관. 법률 자문이나 대리는 하지 않으며, 법률 상담 소개에 대한 성과 수수료는 보류합니다." },
    { name: "Legal", who: "People facing a contract, a civil procedure or paperwork", problem: "Not knowing what to check in a lease, job or consumer contract can lead to disputes.", features: ["Contract checklists", "Document storage", "Administrative dates", "Civil services", "Everyday legal information", "Official bodies", "Finding lawful professional advice"], connect: "Linked to housing, career and family, and to public bodies such as Korea Legal Aid Corporation and Gov24.", now: "Related service guides and official portal links for civil services and rights are partly being prepared.", plan: "Contract checklists and document storage. No legal advice or representation; performance fees for legal referrals are on hold." }),
  A("10", "Family", "now", ["26", "29", "30", "32"],
    { name: "결혼·가족", who: "예비부부, 가정을 꾸린 가족, 부모를 돌보는 자녀", problem: "결혼 준비, 가족 서류, 돌봄 일정, 가족 지원 제도를 가족 구성원이 각자 따로 챙깁니다.", features: ["결혼 준비", "가족 일정", "가정 예산", "가족 공동 목표", "가족 서류", "돌봄 일정", "가족 지원 제도"], connect: "임신·출산 영역과 이어지고, 자녀의 장기 성장은 BABYLOG, 부모 돌봄은 ONGIL로 안내합니다.", now: "결혼·신혼, 육아·양육, 가족 생활, 가족 돌봄 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다.", plan: "가족이 함께 쓰는 공동 일정과 생활 관리." },
    { name: "Family", who: "Couples, families and adult children caring for parents", problem: "Wedding plans, family papers, care schedules and family support are tracked separately by each person.", features: ["Wedding planning", "Family calendar", "Household budget", "Shared goals", "Family documents", "Care schedule", "Family support schemes"], connect: "Linked to pregnancy and birth; a child's long-term growth points to BABYLOG and parent care to ONGIL.", now: "Guides on marriage, parenting, family life and caregiving are partly being prepared for the app launch.", plan: "A shared family calendar and household management." }),
  A("11", "Relationships", "now", ["25"],
    { name: "친구·연애·인간관계", who: "관계 고민이 있는 청소년과 성인", problem: "관계 고민을 털어놓을 곳과 믿을 만한 정보가 부족합니다.", features: ["관계 기록", "기념일", "공동 일정", "소통 학습", "관심사 커뮤니티", "관계 교육 콘텐츠"], connect: "커뮤니티 영역과 공공 상담기관 안내로 이어집니다.", now: "연애·인간관계 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다.", plan: "기념일과 공동 일정. 낯선 사람 사이의 만남 연결은 신원·사기·괴롭힘·개인정보 위험이 있어 별도 안전 설계 없이는 도입하지 않습니다." },
    { name: "Relationships", who: "Teens and adults with relationship questions", problem: "There are few trustworthy places to take relationship worries.", features: ["Relationship notes", "Anniversaries", "Shared plans", "Communication skills", "Interest communities", "Relationship education"], connect: "Linked to the community area and public counselling services.", now: "Relationship guides are partly being prepared for the app launch.", plan: "Anniversaries and shared plans. Connecting strangers is not introduced without a dedicated safety design for identity, fraud, harassment and privacy risks." }),
  A("12", "Lifestyle", "now", ["36"],
    { name: "생활·취미·문화", who: "생활 편의 서비스나 새로운 취미를 찾는 사람", problem: "청소·수리 같은 생활 서비스와 클래스·행사를 믿고 고르기 어렵습니다.", features: ["청소·정리·수리 지원", "클래스·체험·모임", "문화 행사", "디지털 생활 자료", "서비스 탐색·후기"], connect: "생활 마켓, 기업·기관 서비스, Today Feed와 이어집니다.", now: "문화·여가 가이드와 Today Feed의 가 볼 만한 곳·해 볼 만한 경험을 앱 출시에 맞춰 준비하고 있습니다.", plan: "생활 서비스 탐색·예약·후기는 업체 검증과 결제·환불 체계를 갖춘 뒤 단계적으로 엽니다." },
    { name: "Lifestyle", who: "People looking for everyday services or a new hobby", problem: "It is hard to choose cleaning, repairs, classes or events with confidence.", features: ["Cleaning, tidying, repairs", "Classes and experiences", "Cultural events", "Digital life resources", "Service search and reviews"], connect: "Linked to the market, business services and the Today Feed.", now: "Culture and leisure guides, plus places and experiences in the Today Feed, are being prepared for the app launch.", plan: "Service search, booking and reviews open step by step, only after provider checks and payment and refund rules are in place." }),
  A("13", "Mobility", "partial", ["10", "11", "12"],
    { name: "교통·자동차·이동", who: "운전면허를 준비하거나 차를 관리하는 사람, 이동 지원이 필요한 사람", problem: "정비·검사·보험 갱신 일정과 교통 지원 제도를 따로 챙겨야 합니다.", features: ["교통 일정", "자동차 관리", "정비·검사 일정", "운전면허 정보", "이동 서비스 탐색", "교통 지원 제도"], connect: "금융(보험)·은퇴 영역과 이어지고, 어르신 이동 지원은 ONGIL로 안내합니다.", now: "대중교통·이동 지원은 관련 서비스 안내만 일부 준비하고 있습니다. 운전면허·자동차 생활은 계획입니다.", plan: "정비·검사 일정 관리와 면허 정보 가이드." },
    { name: "Mobility", who: "Learner drivers, car owners and people who need mobility support", problem: "Servicing, inspections, insurance renewals and transport support all need separate tracking.", features: ["Travel dates", "Car care", "Servicing and inspection", "Driving licence", "Mobility services", "Transport support schemes"], connect: "Linked to finance (insurance) and retirement; mobility support for older adults points to ONGIL.", now: "Only related guides on public transport and mobility support are being prepared; driving licence and car life are planned.", plan: "Servicing and inspection dates, and a licence guide." }),
  A("14", "Travel", "now", ["13", "37"],
    { name: "여행", who: "여행을 준비하는 사람", problem: "준비물, 예산, 여권·안전 정보가 여러 곳에 흩어져 있습니다.", features: ["여행 일정", "준비물", "여행 예산", "예약 정보 정리", "여행 지원 서비스", "해외 안전 정보"], connect: "방문 국가 색칠·여행 기록·예약 같은 전문 기능은 MY WORLD로 안내합니다.", now: "여행·해외생활 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다. 여권·출입국은 계획입니다.", plan: "여행 준비 체크리스트. 전문 여행 기능은 MY WORLD와 나눠 중복 개발을 줄입니다." },
    { name: "Travel", who: "People preparing a trip", problem: "Packing, budget, passport and safety information are scattered.", features: ["Trip plans", "Packing lists", "Travel budget", "Booking notes", "Travel support", "Safety abroad"], connect: "Country colouring, travel records and booking point to MY WORLD.", now: "Travel and life-abroad guides are partly being prepared for the app launch; passports and immigration are planned.", plan: "Trip checklists — specialist travel features stay in MY WORLD to avoid building them twice." }),
  A("15", "Retirement", "now", ["39", "40"],
    { name: "은퇴·노후", who: "은퇴를 준비하는 중장년과 그 가족", problem: "연금, 노후 예산, 재취업, 건강·주거를 한 번에 계획하기 어렵습니다.", features: ["은퇴 목표", "연금 정보", "노후 예산", "중장년 재취업", "건강·주거·복지", "가족 돌봄", "사회활동 정보"], connect: "금융·복지·건강 영역과 이어지고, 실제 시니어 생활·돌봄·안전은 ONGIL로 안내합니다.", now: "은퇴·시니어 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다. 상속·장례는 계획입니다.", plan: "은퇴 일정과 노후 계획 도구." },
    { name: "Retirement", who: "People in mid-life preparing to retire, and their families", problem: "Pensions, budgets, re-employment, health and housing are hard to plan together.", features: ["Retirement goals", "Pensions", "Later-life budget", "Re-employment", "Health, housing, welfare", "Family care", "Social activity"], connect: "Linked to finance, welfare and health; day-to-day senior living, care and safety point to ONGIL.", now: "Retirement guides are partly being prepared for the app launch; inheritance and funerals are planned.", plan: "Retirement timelines and later-life planning tools." }),
  A("16", "Life Market", "planned", [],
    { name: "생활 마켓", who: "생활용품·디지털 자료·생활 서비스를 찾는 사람, 판매자", problem: "생애 이벤트마다 필요한 물건과 자료를 여러 쇼핑몰에서 따로 찾아야 합니다.", features: ["일반 생활용품", "학습 자료·템플릿", "생활 서비스", "취미·교육 상품", "기업 판매자 상품"], connect: "공유·대여와 개인 간 중고 거래는 SHAREON으로, 판매자 도구는 기업·기관 서비스 영역으로 이어집니다.", now: "제공하지 않습니다. 실제 판매자가 생기기 전에는 상품·예약·결제를 보여 주지 않습니다.", plan: "판매자 확인·환불·분쟁·정산 체계를 검증한 뒤 단계적으로 엽니다. 같은 거래에 NEWON의 두 플랫폼이 수수료를 중복으로 받지 않습니다." },
    { name: "Life Market", who: "People looking for everyday goods, digital resources or services; sellers", problem: "Each life event means hunting for goods and materials across many shops.", features: ["Everyday goods", "Study materials and templates", "Living services", "Hobby and learning products", "Business sellers"], connect: "Sharing, rental and personal used-goods trading point to SHAREON; seller tools sit in Life Business.", now: "Not provided. No products, booking or payment are shown until real sellers exist.", plan: "Opened step by step once seller checks, refunds, disputes and settlement are proven. Two NEWON platforms never both charge a fee on the same transaction." }),
  A("17", "Life Community", "partial", [],
    { name: "커뮤니티", who: "비슷한 상황을 먼저 겪은 사람의 경험이 궁금한 사람", problem: "블로그·카페 후기에서는 광고와 실제 경험을 구분하기 어렵습니다.", features: ["관심사별 질문", "경험 공유", "생활 정보", "후기", "모임", "신고·차단"], connect: "모든 영역과 인간관계 영역에 이어집니다.", now: "혼자 쓰는 모임 기록과 하루 체크를 앱 출시에 맞춰 준비하고 있으며, 다른 사람에게 공개되지 않습니다.", plan: "공개 커뮤니티는 운영 정책과 신고 체계를 갖춘 뒤 도입을 검토합니다. 광고성 후기를 구분하고 건강·재무·법률 같은 민감정보가 공개되지 않게 합니다." },
    { name: "Life Community", who: "People who want to hear from someone who has been there", problem: "In blog and forum reviews it is hard to tell ads from real experience.", features: ["Questions by interest", "Shared experience", "Life tips", "Reviews", "Groups", "Report and block"], connect: "Linked to every area and to relationships.", now: "Private group notes and daily check-ins, not visible to anyone else, are being prepared for the app launch.", plan: "A public community is considered only once moderation and reporting rules exist. Paid reviews are marked and sensitive health, money or legal details are kept from public view." }),
  A("18", "Life Business", "planned", [],
    { name: "기업·기관 서비스", who: "생활 서비스 업체, 교육·콘텐츠 제공자, 기업과 기관", problem: "작은 업체와 기관은 필요한 사람에게 정확하게 닿는 경로가 부족합니다.", features: ["업체·판매자 등록", "서비스·예약 관리", "고객 문의 관리", "직원 권한", "정산·통계", "SaaS 구독", "파트너십"], connect: "생활 마켓·생활 서비스 영역과 파트너십으로 이어집니다.", now: "제공하지 않습니다. 지금은 협력 문의만 받습니다.", plan: "표준화된 기업 SaaS와 판매자 도구. 고객별 외주 앱·웹 제작은 하지 않고 자체 솔루션으로 확장합니다." },
    { name: "Life Business", who: "Living-service providers, education and content providers, companies and institutions", problem: "Small providers and institutions lack an accurate route to the people who need them.", features: ["Provider and seller sign-up", "Services and booking", "Customer inquiries", "Staff roles", "Settlement and statistics", "SaaS plans", "Partnerships"], connect: "Linked to the market, living services and partnerships.", now: "Not provided. Only partnership inquiries are taken today.", plan: "Standard enterprise SaaS and seller tools — our own product, never custom-built client apps or sites." }),
  A("19", "Military", "planned", ["09"],
    { name: "군대·병역·전역", who: "입대 예정자, 복무 중인 장병과 가족, 전역 예정자, 예비군 대상자", problem: "병역판정검사부터 입영, 전역 후 복학·취업까지 정보가 여러 기관에 나뉘어 있습니다.", features: ["병역판정검사·공식 병역 정보", "입영 일정·준비물 체크리스트", "허용된 개인 일정·목표 기록", "군인 금융·복지 제도 안내", "가족 공유 일정", "전역일·복학·취업 체크리스트", "예비군 공식 안내"], connect: "커리어·교육·자격증·복지(청년 지원) 영역과 이어집니다.", now: "아직 제공하지 않습니다. 관련된 취업·자격증·대학 가이드만 준비하고 있습니다.", plan: "필수 병역 정보는 무료로 제공합니다. 군사 보안 정보나 부대 위치 같은 민감한 정보는 수집·공유하지 않고, 복무 중 기기 사용 규정을 고려합니다." },
    { name: "Military", who: "People due to enlist, service members and families, those about to be discharged, reservists", problem: "From the conscription examination to school or work after discharge, information is split across many bodies.", features: ["Examination and official service information", "Enlistment dates and packing checklist", "Permitted personal plans and goals", "Service-member finance and welfare schemes", "Shared family calendar", "Discharge, school and job checklist", "Reserve forces guidance"], connect: "Linked to career, education, certification and welfare (youth support).", now: "Not provided yet. Only related job, certificate and university guides are being prepared.", plan: "Essential service information stays free. No military security information or unit locations are collected or shared, and rules on device use during service are respected." }),
  A("20", "Certification", "now", ["03"],
    { name: "자격증·시험·면허", who: "학생·구직자·직장인, 경력 전환을 준비하는 중장년", problem: "자격 종류, 응시 자격, 접수·시험·발표·갱신 일정을 기관마다 따로 확인해야 합니다.", features: ["자격증 탐색", "응시 자격 확인", "접수·시험·발표·갱신 일정", "학습 계획", "AI 학습", "자체 제작·허가된 모의시험", "학습 자료", "교육기관 탐색", "취득·갱신 관리", "관련 직무 연결"], connect: "커리어·교육 영역, Q-Net 같은 공식 시험기관과 이어집니다.", now: "자격증·시험 가이드를 앱 출시에 맞춰 일부 준비하고 있으며, 국가자격·공인 민간자격·기타 민간자격을 구분해 표시합니다.", plan: "시험 일정 저장·알림과 학습 계획. 기본 정보는 무료입니다." },
    { name: "Certification", who: "Students, job seekers, employees and people changing career in mid-life", problem: "Types, eligibility and registration, exam, result and renewal dates must be checked body by body.", features: ["Finding certificates", "Eligibility", "Registration, exam, result and renewal dates", "Study plans", "AI study", "Own or licensed mock tests", "Study materials", "Training providers", "Holding and renewing", "Related jobs"], connect: "Linked to career and education, and to official exam bodies such as Q-Net.", now: "Certificate guides are partly being prepared for the app launch, marking national, accredited private and other private qualifications.", plan: "Saved exam dates with reminders, and study plans. Basic information is free." }),
  A("21", "Pregnancy & Birth", "now", ["27", "28"],
    { name: "임신·출산", who: "임신을 준비하거나 출산을 앞둔 부부와 가족", problem: "검진 일정, 출산 지원 제도, 출산전후휴가·육아휴직 신청 시기가 서로 맞물려 있습니다.", features: ["임신 준비 일정", "주차별 기록·일정", "산전 검진 일정·메모", "출산 준비물·서류", "정부·지자체 지원 제도", "출산전후휴가·육아휴직", "산후 회복 일정", "배우자·가족 공동 일정"], connect: "가족·복지·커리어(휴직) 영역과 이어지고, 출생 이후 육아·성장 관리는 BABYLOG로 안내합니다.", now: "임신·출산 가이드를 앱 출시에 맞춰 일부 준비하고 있습니다. 임신 준비는 계획입니다.", plan: "일정·체크리스트 저장. 의료 진단 앱이 아니며, 공식 정보와 지원금 안내는 무료입니다." },
    { name: "Pregnancy & Birth", who: "Couples and families planning a pregnancy or expecting a baby", problem: "Check-ups, birth support schemes, maternity and parental leave all have to line up.", features: ["Pre-pregnancy plans", "Week-by-week notes", "Antenatal check-ups", "Birth preparation and documents", "National and local support", "Maternity and parental leave", "Postnatal recovery", "Shared family calendar"], connect: "Linked to family, welfare and career (leave); parenting and growth after the birth point to BABYLOG.", now: "Pregnancy and birth guides are partly being prepared for the app launch; pre-pregnancy planning is planned.", plan: "Saved dates and checklists. Not a medical diagnosis app; official information and benefit guidance are free." }),
];

export const AREA_GROUPS = [
  { id: "1", ids: ["01", "02"], ko: "코어 허브", en: "Core hub", leadKo: "매일 여는 홈과 생애 단계. 다른 모든 영역의 출발점입니다.", leadEn: "The home you open every day and your life stage — where every other area starts." },
  { id: "2", ids: ["03", "04", "05", "06", "20"], ko: "돈·집·일·배움", en: "Money, home, work, learning", leadKo: "예산과 주거, 취업과 학습, 자격증. 독립과 성장의 기본기입니다.", leadEn: "Budgets and housing, jobs, learning and certificates — the basics of standing on your own." },
  { id: "3", ids: ["07", "08", "09"], ko: "안전망", en: "Safety net", leadKo: "건강, 복지·지원금, 계약과 서류. 공식 정보와 공식 창구가 먼저입니다.", leadEn: "Health, welfare and benefits, contracts and papers — official information and channels first." },
  { id: "4", ids: ["10", "11", "15", "19", "21"], ko: "가족·관계·전환", en: "Family, relationships, transitions", leadKo: "결혼과 출산, 입대와 전역, 은퇴. 삶이 크게 바뀌는 순간입니다.", leadEn: "Marriage and birth, enlisting and discharge, retirement — the moments life changes most." },
  { id: "5", ids: ["12", "13", "14", "16", "17", "18"], ko: "생활·생태계", en: "Living & ecosystem", leadKo: "생활 서비스와 이동, 여행, 마켓, 커뮤니티, 기업 서비스로 넓어지는 영역입니다.", leadEn: "Where LIVON widens into services, mobility, travel, the market, community and business tools." },
];

/* review-stage items: need legal / safety review before anything is built */
export const REVIEW_ITEMS = {
  ko: ["금융상품 판매·보험 모집·대출 모집", "부동산 중개", "법률 상담 소개의 성과 수수료", "의료 진료비에 비례한 수수료 (도입하지 않음)", "전문가 서비스 거래", "낯선 사람 사이의 만남 연결", "공개 커뮤니티"],
  en: ["Financial product sales, insurance or loan solicitation", "Property brokerage", "Performance fees for legal referrals", "Fees proportional to medical bills (not introduced)", "Trading professional services", "Connecting strangers to meet", "A public community"],
};

/* ───────── platform: service flow (plan §1) ───────── */
export const FLOW = {
  ko: [["상황 파악", "지금의 생애 단계와 앞둔 이벤트를 고릅니다. 나이보다 직접 고른 상황을 우선합니다."], ["정보 탐색", "관련 영역의 가이드와 공식 제도를 한 흐름으로 봅니다. 제도에는 출처와 확인 기준일이 붙습니다."], ["계획 관리", "할 일과 일정, 체크리스트로 바꿔 둡니다. 기록은 기기에만 저장하는 방식으로 준비하고 있습니다."], ["서비스 연결", "신청은 공식 창구로, 생활 서비스는 향후 검증된 파트너로 연결합니다. 광고는 항상 표시합니다."], ["결과 기록", "끝낸 일과 다음 단계를 남겨 다음 생애 이벤트로 이어 갑니다."]],
  en: [["Understand", "Pick your life stage and the event ahead. What you choose matters more than your age."], ["Explore", "See guides and official schemes from every related area in one flow, each scheme with its source and date checked."], ["Plan", "Turn it into to-dos, dates and checklists — planned to be stored only on your device."], ["Connect", "Applications go to official channels; living services, later, to checked partners. Ads are always labelled."], ["Record", "Keep what is done and what comes next, and carry it into the next life event."]],
};

/* ───────── platform: life-event scenarios ───────── */
const S = (id, areas, ko, en) => ({ id, areas, ko, en });
export const SCENARIOS = [
  S("first-job", ["05", "06", "20", "08", "03"],
    { title: "첫 취업 준비", who: "졸업을 앞두고 첫 직장을 찾는 20대", steps: "생애 단계에서 취업 주제를 열고, 이력서·면접·근로계약 가이드를 봅니다. 청년 취업 지원 제도는 공식 포털에서 확인하고, 지원 일정은 My Life에 적어 둡니다. 입사 후에는 첫 월급 관리와 연말정산, 4대 보험을 이어서 봅니다.", now: "가이드, 공식 포털 안내, 이 기기에 저장되는 일정", later: "지원 일정 알림, AI 면접 연습, 관련 자격증 연결" },
    { title: "Preparing for a first job", who: "Someone in their 20s about to graduate", steps: "Open the job topics in Life Stage, read the CV, interview and contract guides, check youth employment schemes on the official portal and note application dates in My Life. After starting, move on to a first salary, year-end tax and social insurance.", now: "Guides, official portal links and on-device dates", later: "Application reminders, AI interview practice, related certificates" }),
  S("move-out", ["04", "09", "08", "03", "01"],
    { title: "독립과 이사", who: "첫 자취를 시작하는 사회초년생", steps: "집 찾기와 계약 전 확인 사항을 보고, 보증금 보호와 청년 주거 지원을 확인합니다. 이사 일정·공과금·전입신고를 체크리스트로 정리하고, 잠깐 필요한 물건은 SHAREON 대여를 안내받습니다. 계약 만료일은 기록해 둡니다.", now: "주거·이사 가이드, 공식 포털 안내, 기기 저장 기록", later: "이사·입주청소 서비스 연결(업체 검증 후), 계약 만료 알림" },
    { title: "Moving out", who: "A new worker renting for the first time", steps: "Read how to find a home and what to check before signing, check deposit protection and youth housing support, list the move, utilities and registration as a checklist, and get pointed to SHAREON for things you only need briefly. Note the lease end date.", now: "Housing and moving guides, official portals, on-device notes", later: "Moving and cleaning services (after provider checks), lease-end reminders" }),
  S("marriage", ["10", "04", "03", "08", "09"],
    { title: "결혼 준비", who: "결혼을 앞둔 두 사람", steps: "결혼 일정과 예산을 세우고, 혼인신고와 가족 서류를 확인합니다. 신혼부부 주거·지원 제도를 공식 출처로 보고, 함께 쓸 예산과 목표를 정리합니다.", now: "결혼·신혼 가이드, 지원 제도 공식 안내", later: "가족 공동 일정, 결혼 준비 생활 서비스 연결" },
    { title: "Getting married", who: "A couple planning their wedding", steps: "Set a timeline and budget, check marriage registration and family papers, read newlywed housing and support schemes from official sources, and agree a shared budget and goals.", now: "Marriage guides and official scheme links", later: "A shared family calendar, wedding-related living services" }),
  S("birth", ["21", "08", "05", "10", "07"],
    { title: "임신·출산", who: "첫 아이를 기다리는 부부", steps: "검진 일정 안내를 찾아 두고, 출산 지원 제도와 출산전후휴가·육아휴직 시기를 확인합니다. 출산 준비물과 서류를 체크리스트로 정리하고, 출생 이후 아이의 기록과 성장은 BABYLOG로 이어 갑니다.", now: "임신·출산 가이드, 육아휴직·양육 지원 정보", later: "주차별 일정, 배우자·가족 공동 일정" },
    { title: "Pregnancy & birth", who: "A couple expecting their first child", steps: "Find check-up guidance, check birth support schemes and the timing of maternity and parental leave, put birth preparations and papers on a checklist, and carry the child's records and growth into BABYLOG after the birth.", now: "Pregnancy guides, parental leave and childcare support information", later: "Week-by-week dates, a shared family calendar" }),
  S("enlist", ["19", "06", "05", "20", "03"],
    { title: "군 입대", who: "입영을 앞둔 20대와 가족", steps: "병역판정검사와 입영 일정을 공식 기관 안내로 확인하고, 입영 준비물을 체크리스트로 챙깁니다. 복무 중에는 허용된 범위의 목표와 저축을 기록하고, 전역이 가까워지면 복학·취업·자격증 준비로 넘어갑니다.", now: "군 복무 영역은 아직 제공하지 않습니다. 관련 취업·자격증·대학 가이드만 준비하고 있습니다.", later: "Military 영역 전체 (공식 정보 무료, 군사 보안 정보 수집 안 함)" },
    { title: "Enlisting", who: "Someone in their 20s about to enlist, and their family", steps: "Check the examination and enlistment dates with the official body, pack with a checklist, record permitted goals and savings during service, and move on to school, work and certificates as discharge approaches.", now: "The military area is not provided yet; only related job, certificate and university guides are being prepared.", later: "The whole Military area (official information free, no military security data collected)" }),
  S("retire", ["15", "03", "07", "08", "05"],
    { title: "은퇴 준비", who: "은퇴를 5~10년 앞둔 50대", steps: "은퇴 시점과 노후 소득을 그려 보고, 국민연금·퇴직연금을 이해합니다. 건강과 주거, 시니어 복지를 확인하고 재취업·사회활동을 찾습니다. 부모님이나 본인의 실제 돌봄은 ONGIL로 안내받습니다.", now: "은퇴·시니어 가이드, 연금 이해, 복지 공식 안내", later: "노후 예산·은퇴 일정 도구" },
    { title: "Preparing to retire", who: "Someone in their 50s, five to ten years from retiring", steps: "Sketch the timing and later-life income, understand national and retirement pensions, check health, housing and senior welfare, and look at re-employment and social activity. Real day-to-day care for parents or yourself points to ONGIL.", now: "Retirement guides, pensions explained, official welfare links", later: "Later-life budget and retirement timeline tools" }),
];

/* ───────── page copy ───────── */
export const C30 = {
  ko: {
    notice: "21개 핵심 영역은 장기 사업 계획이고, 40개 생활 분야는 정보 콘텐츠 분류입니다. 모두 제공 중인 기능이라는 뜻이 아니며, 앱 출시를 준비 중인 것과 계획을 나눠 표시합니다.",
    stats: [["21", "핵심 사업 영역 (장기 계획)"], ["40", "생활 분야 (콘텐츠 분류)"], ["34", "생애 이벤트 가이드 (앱 출시 준비 중)"], ["228", "생활 주제 가이드 (앱 출시 준비 중)"]],
    seo: {
      overview: { title: "LIVON | NEWON — 삶의 순간에 맞는 서비스 연결", desc: "이사·취업·결혼·임신·출산·병역·은퇴. 인생의 중요한 변화와 일상생활을 공식 정보·체크리스트·일정으로 연결하는 생애 이벤트 중심 플랫폼 LIVON. 지금은 LIVON 웹에서 무료로 이용할 수 있고 앱은 준비 중입니다." },
      platform: { title: "LIVON Platform | 21개 핵심 영역과 40개 생활 분야 — NEWON", desc: "Life Dashboard부터 군대·자격증·임신·출산까지 21개 핵심 영역의 대상·문제·기능·연결, 생애 이벤트 시나리오, 신뢰 원칙, 지금 제공 기능과 계획, FAQ." },
      business: { title: "LIVON Business | 사업 모델·수익 구조·로드맵 — NEWON", desc: "LIVON의 고객과 지불 주체, B2C·B2B·B2B2C·B2G 구조, 구독·연결·기업 수익 모델(모두 제안 단계), 진입 전략, P0–P7 로드맵과 운영 원칙." },
      partnerships: { title: "LIVON Partnerships | 협업 모델과 PoC 제안 — NEWON", desc: "기업 인사·복지, 생활 서비스, 교육기관, 지자체·공공기관과의 협업 모델, 임직원 생활복지 PoC 등 파일럿 제안, 데이터·API 연계 원칙과 진행 절차." },
      contact: { title: "LIVON Contact | 목적별 문의 안내 — NEWON", desc: "개인 이용, 기업 복지 협력, 생활 서비스 제휴, 공공기관 협력, 기술 연계, 언론, 투자 문의를 목적별로 안내하고 NEWON 공식 문의 창구로 연결합니다." },
    },
    define: {
      kicker: "What is LIVON", title: "삶의 순간에 맞는\n서비스 연결.",
      lead: "LIVON은 인생의 중요한 변화와 일상생활을 연결하는 생애 이벤트 중심 종합 플랫폼입니다. 이사·취업·결혼·임신·출산·병역·은퇴처럼 삶이 바뀌는 순간에 필요한 공식 정보와 일정·체크리스트를 하나의 흐름으로 잇고, 앞으로는 검증된 생활 서비스까지 연결합니다. 중요한 순간을 놓치지 않도록 돕는 것이 목표입니다.",
      cols: ["고객이 겪는 문제", "지금 흔한 방법", "LIVON의 방식"],
      rows: [["생애 이벤트마다 정보가 흩어져 있다", "포털 검색, 블로그, 기관 사이트를 하나씩 찾아봅니다.", "생애 단계와 이벤트를 기준으로 관련 분야를 한 흐름에 묶습니다."], ["알아도 실행으로 이어지지 않는다", "메모와 캘린더에 따로 적어 둡니다.", "할 일·일정·체크리스트로 바꾸고, 신청은 공식 창구로 연결합니다."], ["내 상황에 맞는 정보인지 알기 어렵다", "나이·지역 조건을 직접 대조합니다.", "대상·지역·확인 기준일을 함께 보여 주고, 직접 고른 상황을 우선합니다."], ["믿을 만한 서비스를 고르기 어렵다", "광고와 후기가 섞인 검색 결과를 봅니다.", "향후 검증된 파트너 서비스만 연결하고, 광고는 항상 표시합니다. (계획)"]],
    },
    customers: {
      kicker: "Who it is for", title: "누구를 위한 플랫폼인가요?", lead: "중심은 생애 이벤트를 앞둔 개인과 가족입니다. 기업·기관은 그들을 돕는 고객으로 뒤따릅니다.",
      items: [["생애 이벤트를 앞둔 개인", "취업·독립·결혼·출산·입대·은퇴를 앞둔 사람. 초기에는 출산과 이사를 앞둔 수도권 20~30대에 집중할 계획입니다."], ["가족", "결혼을 함께 준비하는 부부, 출산을 앞둔 가족, 부모를 돌보는 자녀처럼 일정과 서류를 함께 챙겨야 하는 가구."], ["기업 인사·복지 담당자", "직원의 입사·이사·출산·가족돌봄·은퇴 시점에 사내 제도와 공공 제도를 함께 안내하고 싶은 기업 (구상)."], ["기관·생활 서비스 파트너", "주민에게 생활 정보를 알리려는 지자체·공공기관, 필요한 순간에 소개되고 싶은 이사·청소·교육 업체 (구상)."]],
    },
    diff: {
      kicker: "Why LIVON", title: "기존 방법과 무엇이 다른가요?", lead: "아래는 공개된 서비스 성격을 기준으로 한 차별화 가설이며, 실제 이용 데이터로 검증하기 전입니다.",
      items: [["정부24·보조금24 같은 공공 포털", "공공 서비스와 지원금을 찾는 데 강합니다. LIVON은 그 제도를 생애 이벤트의 일정과 체크리스트 안에 배치하고, 신청은 다시 공식 창구로 보냅니다."], ["포털 검색·블로그", "정보는 많지만 출처와 최신성, 광고 여부를 구분하기 어렵습니다. LIVON은 출처와 확인 기준일을 붙이고 광고를 항상 표시합니다."], ["캘린더·메모 앱", "기록은 잘 되지만 무엇을 언제 해야 하는지는 알려 주지 않습니다. LIVON은 이벤트별로 확인할 것을 먼저 제시합니다."]],
    },
    now: {
      kicker: "Service Status", title: "지금 LIVON의 상태", lead: "2026년 10월 기준입니다. 계획에 있는 기능을 지금 운영 중인 것처럼 표시하지 않습니다.",
      groups: [
        ["now", "앱 출시 준비 중 — 첫 앱에 담을 기능", [["Life Stage", "10대부터 70대 이상까지 7단계 주제·가이드·체크리스트"], ["생애 이벤트 가이드", "34개 생애 이벤트 준비 가이드, 228개 생활 주제"], ["Today Feed", "가 볼 만한 곳, 해 볼 만한 경험, 생활 가이드"], ["My Life", "할 일·일정·루틴·기록 — 이 기기에만 저장"], ["공식 정보 안내", "복지로·정부24 등 17개 공식 포털, 확인 기준일 표시"]]],
        ["preparing", "준비 중", [["LIVON 앱 V1", "출시 전이며 출시 일정은 확정되지 않았습니다."], ["탐색 일부", "장소·강좌 등 일부 정보 제공처를 점검하고 있습니다."]]],
        ["planned", "계획·검토", [["21개 영역 확장", "군대·자격증·임신·출산 일정과 체크리스트 등"], ["AI·개인화", "공식 정보와 AI 추정을 구분해 표시하는 방향"], ["공개 커뮤니티", "운영 정책과 신고 체계를 갖춘 뒤 검토"], ["생활 서비스·마켓", "업체 검증과 결제·환불 체계 이후"], ["유료 구독·기업 솔루션", "모두 제안 단계, 가격 미정"]]],
      ],
    },
    future: {
      kicker: "Long-term Vision", title: "21개 핵심 영역으로\n인생 전체를 잇습니다.", lead: "장기적으로 LIVON은 아래 21개 영역을 하나의 플랫폼에서 연결합니다. 영역마다 별도 앱이나 서버를 만들지 않고 공통 구조를 함께 씁니다. 지금 모두 제공되는 것은 아닙니다.",
      prioTitle: "추진 우선순위",
      prio: [["생애 단계·21개 영역·대시보드", "지금 필요한 정보를 찾게 하는 LIVON만의 정체성"], ["군대·자격증·출산을 포함한 이벤트 관리", "일정·체크리스트·공식 정보·개인 기록의 연결"], ["통합 AI·개인화", "일상 이용과 구독 가치의 검증"], ["생활 서비스·마켓·기업 SaaS", "실제 거래와 반복 매출의 확보"], ["NEWON 연동·확장", "검증된 핵심 기능을 바탕으로 확장"]],
      more: "21개 영역 자세히 보기",
    },
    platform: {
      flowKicker: "How LIVON works", flowTitle: "상황에서 출발해\n기록으로 이어집니다.", flowLead: "LIVON의 모든 영역은 같은 다섯 단계로 움직입니다. 한 생애 이벤트를 끝내면 그 기록이 다음 이벤트의 출발점이 됩니다.",
      areasKicker: "21 Core Areas", areasTitle: "21개 핵심 영역", areasLead: "최종 사업계획서 기준의 장기 확장 영역입니다. 영역마다 대상 사용자, 해결하려는 문제, 주요 기능, 연결되는 서비스와 정보 분야를 정리했습니다. 영역별로 별도 앱이 있는 것이 아니라 하나의 LIVON 안에서 공통 구조를 함께 씁니다.",
      f: { who: "대상 사용자", problem: "해결하려는 문제", features: "주요 기능 (장기 계획)", connect: "연결", now: "앱 출시 준비 중", plan: "계획", cats: "관련 생활 분야" },
      statusKicker: "Now & Next", statusTitle: "앱 출시 준비 중인 것과 앞으로의 계획", statusLead: "21개 영역의 현재 상태를 한곳에 모았습니다. '앱 출시 준비 중'은 첫 앱에 정보·가이드 또는 기본 도구를 일부 담을 계획이라는 뜻이며, 영역의 모든 기능이 완성되었다는 뜻은 아닙니다.",
      sgroups: { now: "앱 출시 준비 중 (일부) — 정보·가이드·기본 도구", partial: "관련 안내만 일부", planned: "계획 — 아직 제공하지 않음", review: "검토 단계 — 법률·안전 검토가 먼저" },
      appRow: ["LIVON 앱 V1", "준비 중 · 출시 전"],
      catsKicker: "40 Life Categories", catsTitle: "정보 콘텐츠 분류: 5개 영역, 40개 생활 분야", catsLead: "21개 핵심 영역 아래에서 실제 정보 가이드를 정리하는 콘텐츠 분류입니다. 분야를 고르면 세부 주제와 공식 정보 출처, 제공 상태를 볼 수 있습니다. 분야 수가 곧 제공 중인 기능 수는 아닙니다.",
      scnKicker: "Life-event Scenarios", scnTitle: "생애 이벤트별 이용 시나리오", scnLead: "실제 이용 흐름을 여섯 가지 이벤트로 그려 보았습니다. 각 시나리오에서 첫 앱에 담을 것과 앞으로 더해질 것을 나눠 적었습니다.", scnF: { who: "이런 분", flow: "이용 흐름", now: "앱 출시 준비 중", later: "앞으로 (계획)", areas: "관련 영역" },
      usersKicker: "Who uses it how", usersTitle: "사용자 유형별 이용 방식",
      users: [["개인 사용자", "앱 출시 준비 중: 로그인 없이 탐색하고 기록을 기기에 저장하는 방식을 준비하고 있습니다.", "앞으로: 원하는 경우에만 계정으로 저장하고, 구독·구매 시점에만 로그인을 요청합니다."], ["판매자·서비스 업체", "지금: 제공하지 않으며 협력 문의만 받습니다.", "앞으로: 상품·예약·고객 관리 도구 (업체 검증 후)."], ["교육·콘텐츠 제공자", "지금: 콘텐츠 검수와 정보 제안을 문의로 받습니다.", "앞으로: 강의·학습 자료·프로그램 안내."], ["기업·기관", "지금: 협력 문의를 받습니다.", "앞으로: 임직원 생활복지, 기관용 정보 안내 SaaS, 파트너십."]],
      linkKicker: "How it connects", linkTitle: "기능 간 연결 구조",
      links: [["상황이 영역을 묶습니다", "생애 단계와 이벤트를 고르면 관련된 여러 영역이 한 흐름으로 묶입니다."], ["일정은 대시보드로 모입니다", "각 영역에서 저장한 일정·기한·체크리스트가 Life Dashboard에 모입니다."], ["공식 정보가 먼저입니다", "제도는 출처·기준일·대상 지역과 함께 보여 주고, 신청은 각 기관에서 합니다."], ["서비스 연결은 마지막 단계입니다", "생활 서비스는 향후 검증된 파트너만 연결하며 광고와 제휴는 항상 표시합니다."], ["AI는 허용된 정보만 씁니다 (계획)", "사용자가 허용한 기록만 이용하고, 공식 정보와 AI 추정을 구분해 보여 줍니다."], ["다른 NEWON 앱으로 넘깁니다", "육아는 BABYLOG, 반려 생활은 PETLOG, 여행은 MY WORLD, 대여는 SHAREON, 돌봄은 ONGIL. 지금 앱 사이 데이터 연동은 없고, 앞으로도 동의한 항목만 연결합니다."]],
      trustKicker: "Privacy, Security & Trust", trustTitle: "개인정보·보안·신뢰 원칙",
      trust: ["회원가입·로그인 없이 공개 정보를 탐색하는 익명 이용을 기본으로 합니다.", "My Life의 개인 기록은 기기에만 저장하는 방식으로 준비하고 있습니다.", "생애주기·가족·건강·재무 정보는 꼭 필요한 만큼만 다룹니다.", "로그인은 기록 동기화·구매·구독처럼 계정이 꼭 필요한 순간에만 요청합니다. (계획)", "다른 NEWON 앱과 사용자 데이터를 자동으로 공유하지 않습니다.", "개인을 알아볼 수 있는 정보를 제휴사에 넘기지 않는 것을 원칙으로 합니다.", "대가를 받은 노출은 광고·제휴로 표시하고, 광고성 후기와 실제 후기를 구분합니다.", "AI 답변에는 공식 출처와 한계를 함께 보여 줍니다. (계획)", "군사 보안 정보나 부대 위치 같은 민감한 정보는 수집하지 않습니다.", "의료·법률·금융·부동산은 일반 정보와 공식 창구 안내만 제공합니다."],
      appKicker: "Using LIVON", appTitle: "LIVON 이용 안내",
      app: [["앱 출시 준비 중", "LIVON 앱", "현재 LIVON 앱 출시를 준비하고 있습니다. 생애 단계, 생애 이벤트 가이드, Today Feed, My Life, 공식 정보 안내를 담을 계획입니다."], ["준비 중: LIVON 앱", "출시 전", "앱 V1을 준비하고 있습니다. 출시 일정은 확정되지 않았으며, 출시되면 이 사이트에서 안내합니다."], ["계획: 앱 하단 5개 탭", "홈 · 탐색 · AI · 커뮤니티 · 마이", "처음에는 필요한 분야만 보여 주고, 관심사가 늘어날수록 기능을 발견하도록 설계할 계획입니다."]],
      faqKicker: "FAQ", faqTitle: "자주 묻는 질문",
      faq: [["LIVON은 지금 무료인가요?", "LIVON은 현재 앱 출시를 준비하고 있습니다. 현재 판매 중인 유료 상품은 없습니다. 유료 구독은 제안 단계이며 가격이 정해지지 않았습니다."], ["LIVON 앱은 언제 나오나요?", "앱은 준비 중이며 출시 일정은 확정되지 않았습니다. 출시되면 이 사이트와 NEWON 공식 채널에서 안내합니다."], ["21개 영역이 모두 지금 쓸 수 있는 기능인가요?", "아닙니다. 21개 영역은 장기 사업 계획입니다. 일부 영역의 정보·가이드와 기본 기록 도구를 앱 출시에 맞춰 준비하고 있으며, 위의 상태표에서 영역별로 확인할 수 있습니다."], ["21개 핵심 영역과 40개 생활 분야는 어떻게 다른가요?", "21개 영역은 기능과 서비스를 묶는 사업 단위이고, 40개 분야는 정보 가이드를 정리하는 콘텐츠 분류입니다. 영역 카드마다 관련 분야 번호를 함께 적었습니다."], ["지원금 신청을 대신해 주나요?", "아니요. LIVON은 제도를 찾고 이해하도록 돕고, 신청과 자격 확인은 각 기관의 공식 창구에서 하도록 연결합니다. 공공 지원금 안내에는 수수료가 없습니다."], ["금융·법률·부동산 상담을 받을 수 있나요?", "LIVON은 일반 정보와 공식 상담 창구 안내만 제공합니다. 금융상품 판매·투자 자문·보험 모집·법률 대리·부동산 중개를 하지 않습니다."], ["입력한 기록은 어디에 저장되나요?", "LIVON은 현재 앱 출시를 준비하고 있습니다. 기록은 사용하는 기기에만 저장하고 NEWON 서버로 보내지 않는 방식으로 준비하고 있습니다."], ["중고 물건을 사고팔 수 있나요?", "LIVON에서는 개인 간 중고 거래를 하지 않습니다. 물건의 공유·대여와 개인 간 거래는 NEWON의 SHAREON을 이용해 주세요."]],
    },
    business: {
      modelKicker: "Business Model", modelTitle: "누가 쓰고, 누가 지불하나요?", modelLead: "LIVON의 핵심 생활 정보는 무료로 유지합니다. 매출은 고급 기능을 원하는 개인·가족, 직원 복지를 운영하는 기업, 검증된 생활 서비스 파트너, 기관에서 나오는 구조를 계획합니다. 현재 판매 중인 유료 상품은 없습니다.",
      structure: [["B2C · 개인", "생애 이벤트를 앞둔 개인 — 기본 무료, 고급 관리·AI 구독 (제안)"], ["B2C · 가족", "부부·부모 돌봄 가구 — 가족 공동 관리 구독 (제안)"], ["C2C · 개인 간 거래", "LIVON에서 직접 운영하지 않습니다. 공유·대여와 개인 간 중고 거래는 SHAREON으로 연결합니다."], ["B2B · 기업", "직원 복지를 운영하는 기업 — 임직원 생활복지, 기업 SaaS (제안)"], ["B2B2C · 생활 서비스 파트너", "이사·청소·교육 업체 — 서비스 연결·거래 수수료 (제안, 업체 검증과 결제 체계 이후)"], ["B2G · 지자체·공공기관", "주민 생활 정보 안내 — 기관용 SaaS·정보 서비스 계약 (제안)"]],
      revKicker: "Revenue Models", revTitle: "수익 모델 분류", revLead: "최종 사업계획서의 12개 수익 모델에 이벤트 패키지·공공 SaaS·자격증 강좌 제휴를 더해 유형별로 정리했습니다. 모두 판매 전 제안이며, 요율과 가격은 정하지 않았습니다.",
      revCols: ["수익 모델", "지불 주체", "수익 방식", "상태"], revStatus: "제안 · 판매 전",
      plansKicker: "Subscription", plansTitle: "구독 모델 (제안)", plansLead: "지금 판매 중인 유료 기능은 없습니다. 아래 구성은 사업계획서의 제안이며 판매하지 않습니다. 요금은 AI·결제·서버·고객 지원 비용과 실제 수요를 확인한 뒤 정하고, 확정 전에는 가격을 표시하지 않습니다.",
      plans: [["Free", "앱 출시 준비 중", "생애 단계, 이벤트 가이드, 공식 정보, 기기 저장 기록. 핵심 생활 정보는 앞으로도 무료로 유지합니다."], ["Plus", "제안", "고급 기록과 통계, 생활 관리 기능."], ["Pro", "제안", "AI 기능과 개인화, 확장 관리."], ["Family", "제안", "가족 공동 일정과 생활 관리."]],
      plansBiz: "기업·판매자용으로는 무료 등록부터 소규모·성장·고급 단계와 기관 맞춤 계약까지 단계형 구독을 제안 단계에서 검토하고 있습니다.",
      feeKicker: "Transactions & Fees", feeTitle: "거래·예약·중개 수익의 원칙", feeLead: "생활 서비스 예약, 클래스, 생활용품, 교육 자료 연결 수수료는 결제·세금·환불·분쟁 비용을 검증하기 전이라 요율을 정하지 않았습니다. 분야별 원칙은 다음과 같습니다.",
      fees: [["무료로 유지", "복지·지원금, 병역·입영 공식 정보, 자격증·시험 기본 정보, 임신·출산 공식 정보"], ["도입하지 않음", "의료 진료비에 비례한 수수료"], ["보류", "법률 상담 소개에 대한 성과 수수료"], ["별도 검토", "금융·보험 상품은 규제·계약별로, 부동산 중개는 법률 검토 후"], ["원가 검증 후 결정", "생활 서비스·클래스·생활용품·교육 자료 중개 수수료, 개인 간 거래 안전결제"], ["중복 금지", "같은 거래에 NEWON의 두 플랫폼이 수수료를 중복으로 받지 않습니다."]],
      mktKicker: "Market & Opportunity", mktTitle: "시장의 문제와 사업 기회",
      mkt: [["흩어진 정보", "생애 이벤트마다 필요한 정보가 공공 포털, 기관 사이트, 블로그에 나뉘어 있습니다."], ["정보와 실행의 단절", "제도를 알아도 일정과 신청, 필요한 서비스로 이어지는 도구가 부족합니다."], ["모두가 겪는 전환", "취업·독립·결혼·출산·은퇴는 대부분의 성인이 겪습니다. 금액 기준 시장 규모는 근거 없이 추정해 제시하지 않습니다."]],
      diffTitle: "경쟁 서비스와의 차별화 가설",
      diffs: [["공공 포털 (정부24·보조금24)", "제도 검색 중심 → LIVON은 생애 이벤트의 일정·체크리스트 안에 제도를 배치하고 신청은 공식 창구로 연결"], ["포털 검색·블로그", "출처·최신성·광고 구분이 어려움 → 출처와 확인 기준일, 광고 표시"], ["캘린더·메모 앱", "기록 중심 → 이벤트별로 확인할 것을 먼저 제시"], ["다른 NEWON 앱", "전문 기능을 복제하지 않고 적절한 순간에 연결하는 허브 역할"]],
      gtmKicker: "Go-to-market", gtmTitle: "초기 시장 진입 전략 (계획)",
      gtm: [["무료 정보 습관", "생애 이벤트 검색 유입과 체크리스트 공유로 무료 이용 습관을 만듭니다."], ["두 가지 이벤트에 집중", "출산과 이사를 앞둔 수도권 20~30대를 첫 고객으로 삼아 콘텐츠를 깊게 만듭니다."], ["구독 가치 검증", "앱 출시 후 개인·가족 구독의 가격과 전환을 실험합니다."], ["기업 복지 파일럿", "기업 인사·복지 부서와 소규모 파일럿을 제안합니다."]],
      roadTitle: "P0–P7, 단계별로 넓힙니다.", roadLead: "각 단계는 완료 기준을 통과한 뒤 다음 단계로 넘어갑니다. 일정은 법률 검토·결제 계약·스토어 심사 결과에 따라 달라질 수 있는 목표이며 약속이 아닙니다.",
      rulesExtra: ["같은 거래에 NEWON의 두 플랫폼이 수수료를 중복으로 받지 않습니다.", "개인을 알아볼 수 있는 정보를 제휴사에 넘기지 않는 것을 원칙으로 합니다.", "구독을 도입하기 전에 자동결제와 해지 조건을 먼저 명확히 안내합니다."],
      ctaTitle: "LIVON과 함께\n사업 기회를 검토해 보세요.", ctaLead: "임직원 생활복지, 기관용 정보 안내, 생활 서비스 연결 등 협력 가능성을 NEWON Business 문의로 알려 주세요.", ctaBiz: "기업 협력 문의", ctaPartner: "파트너십 보기",
    },
    partnerships: {
      visionKicker: "Collaboration Vision", visionTitle: "필요한 순간에,\n검증된 정보와 서비스가 닿도록.", visionLead: "LIVON은 사람들이 삶의 전환점을 지날 때 정확한 정보와 믿을 만한 서비스를 만나게 하려 합니다. 기업과 기관은 그 순간에 필요한 사람에게 닿는 경로를 얻습니다. 아래 내용은 모두 협력 제안이며, 현재 체결된 협약이나 진행 중인 파일럿은 없습니다.",
      vision: [["사용자 가치가 먼저", "협력은 이용자에게 실제로 도움이 되는지부터 확인합니다."], ["표시는 투명하게", "출처, 광고, 제휴를 항상 구분해 보여 줍니다."], ["작게 시작해 검증", "범위를 좁힌 파일럿으로 시작하고 결과로 판단합니다."]],
      modelsKicker: "Collaboration Models", modelsTitle: "협업 모델", modelsF: { who: "협력 대상", what: "협력 내용", value: "파트너가 얻는 가치", cond: "조건" },
      models: [
        ["임직원 생활복지", "기업 인사·복지 부서", "직원의 입사·이사·결혼·출산·가족돌봄·은퇴 시점에 사내 제도와 공공 제도를 한 흐름으로 안내합니다.", "복지 제도 활용도를 높이고 반복 문의를 줄이는 효과를 기대합니다.", "직원 개인정보 최소 처리. 회사가 개별 직원의 상황을 열람하지 않는 구조로 설계합니다."],
        ["생활 서비스 연결", "이사·청소·정리·수리 업체", "이사나 입주 같은 이벤트 체크리스트의 해당 단계에서 검증된 업체를 안내합니다.", "서비스가 필요한 시점의 이용자에게 닿는 경로.", "업체 확인, 가격·후기 표시, 결제·환불 체계를 갖춘 뒤 시작하며 광고는 항상 표시합니다."],
        ["교육·자격증 제휴", "교육기관, 자격시험·강의 플랫폼", "시험 일정과 학습 계획 옆에 강좌와 학습 자료를 안내합니다.", "준비를 시작하는 시점의 학습자와 만날 수 있습니다.", "공식 시험 일정이 먼저이며, 합격을 약속하는 표현은 쓰지 않습니다."],
        ["공공 생활 정보 안내", "지자체·공공기관", "전입·출산·청년 정착처럼 주민의 생애 이벤트에 맞춘 안내를 함께 만듭니다.", "제도를 필요한 주민에게 알기 쉽게 전달.", "공공 조달·협약 절차를 따르며 출처를 표시합니다."],
        ["금융·보험·생활 플랫폼", "HR·금융·보험·생활 앱 사업자", "일반 금융 교육 콘텐츠와 표시된 광고, 기술 연계 가능성을 검토합니다.", "생애 이벤트 맥락의 정보 접점.", "LIVON은 상품 모집·판매·중개를 하지 않으며 규제 검토가 먼저입니다."],
      ],
      pocKicker: "PoC & Pilot Proposals", pocTitle: "PoC·파일럿 제안", pocLead: "실제로 검토해 볼 수 있는 출발점입니다. 범위와 기간은 예시이며, 앱·계정 기능의 준비 상태와 협의에 따라 정합니다.", pocF: { scope: "범위", period: "기간 (예시)", measure: "확인할 지표", cond: "전제 조건" },
      pocs: [
        ["임직원 생활복지 PoC", "직원의 이사·출산·가족돌봄 상황에 맞춰 필요한 사내·공공 제도 정보를 연결합니다. 3개 이벤트의 안내와 체크리스트, 사내 제도 표기를 함께 구성합니다.", "8~12주", "체크리스트 이용률, 익명 만족도 설문, 인사팀 반복 문의 변화", "계약과 개인정보 처리 합의, 직원 개인 기록은 회사가 볼 수 없는 구조"],
        ["지자체 생애 이벤트 안내 파일럿", "전입·출산·청년 정착 중 한두 가지 이벤트를 골라 지역 제도를 출처와 함께 안내합니다.", "3~6개월", "안내 이용, 공식 신청 페이지로 이동한 비율, 정보 오류 신고", "공공 조달·협약 절차, 지역 제도 최신성 관리 방식 합의"],
        ["생활 서비스 연결 파일럿", "한 지역에서 이사·입주청소 단계에 검증된 업체를 안내합니다.", "업체·결제 준비 후 협의", "연결 건수, 후기, 분쟁·환불 건수", "업체 확인, 결제대행·환불 체계, 법률 검토 완료"],
      ],
      dataKicker: "Data & API", dataTitle: "데이터·API 연계 가능성", dataLead: "현재 외부에 제공하는 LIVON API는 없습니다. 아래는 검토 중인 가능성과 그 원칙입니다.",
      data: ["LIVON은 공식 포털 정보와 일부 공공데이터를 안내에 활용하는 방향으로 앱 출시를 준비하고 있으며, 일부 제공처는 점검 중입니다.", "검토: 기업·기관에 생애 이벤트 안내 콘텐츠를 제공하는 라이선스 방식", "검토: 기관 시스템과 제도·일정 정보를 주고받는 연계", "검토: 사용자가 동의한 항목만 다른 NEWON 앱으로 넘기는 연결", "원칙: 동의 기반, 최소 수집, 필요한 경우 집계된 정보만 다루고 개인을 알아볼 수 있는 정보는 제공하지 않습니다.", "원칙: 접근 권한·보안·위탁 계약을 연계 전에 먼저 정합니다."],
      campKicker: "Joint Services & Campaigns", campTitle: "공동 서비스·공동 캠페인 (제안)",
      camps: [["생애 이벤트 체크리스트 공동 제작", "기관이 내용을 검수하고 LIVON이 이용 흐름을 설계합니다."], ["시즌 안내", "입학·이사철·연말정산·전역 시기에 맞춘 안내."], ["공익 정보 캠페인", "잘 알려지지 않은 지원 제도를 필요한 사람에게 알립니다."], ["브랜드 스폰서 콘텐츠", "생애 이벤트에 맞는 정보 콘텐츠 — 항상 광고로 표시합니다."]],
      valueKicker: "Expected Value", valueTitle: "협력 시 기대 가치",
      values: [["기업", "직원 복지의 체감도와 활용도"], ["생활 서비스 업체", "필요한 시점의 이용자와의 접점"], ["교육기관", "준비를 시작한 학습자와의 만남"], ["지자체·공공기관", "제도를 알기 쉽게 전달하는 경로"]],
      ctaSecond: "NEWON Business 문의",
    },
    contact: {
      purposeKicker: "Inquiry Guide", purposeTitle: "문의 목적별 안내", purposeLead: "목적에 맞는 창구를 고르면 더 빠르게 답변드릴 수 있습니다. 모든 링크는 NEWON의 기존 공식 문의 창구로 연결됩니다.",
      privacy: "문의에는 주민등록번호, 건강·병력, 금융 계좌, 가족의 민감한 사정처럼 답변에 필요하지 않은 개인정보나 민감정보를 적지 말아 주세요. 이름과 회신 받을 연락처, 문의 내용이면 충분합니다.",
      f: { what: "이런 문의", include: "담아 주시면 좋은 내용", go: "문의하기" },
      items: [
        ["personal", "개인 이용 문의", "앱 출시 소식, 정보 오류 제보 같은 일반 문의.", "이용한 화면이나 주제, 오류라면 해당 공식 출처"],
        ["feature", "기능·사용 관련 문의", "My Life 기록, 생애 단계, 이벤트 가이드가 제대로 동작하지 않을 때.", "사용 기기와 브라우저, 어떤 화면에서 무엇이 안 되었는지"],
        ["welfare", "기업 복지 협력", "임직원 생활복지 PoC, 직원 생애 이벤트 안내 도입 검토.", "회사 규모, 관심 있는 이벤트(이사·출산·돌봄 등), 희망 시기"],
        ["service", "생활 서비스 제휴", "이사·청소·정리·교육 등 생활 서비스 업체의 연결 제안.", "서비스 분야와 지역, 사업자 정보, 제공 방식"],
        ["public", "공공기관·지자체 협력", "주민 생활 정보 안내, 생애 이벤트 파일럿, 공공 정보 검수.", "기관명, 대상 주민과 이벤트, 추진 절차"],
        ["tech", "기술·API 연계", "데이터·콘텐츠 연계, 기관 시스템 연동 가능성.", "연계하려는 정보의 종류와 방식, 보안 요건"],
        ["media", "언론·미디어 문의", "취재, 인터뷰, 보도 자료 요청.", "매체명, 마감 시점, 질문 요지"],
        ["invest", "투자 관련 문의", "NEWON과 LIVON 사업에 대한 투자 관련 문의.", "소속, 관심 분야, 희망 미팅 방식"],
      ],
      mailNote: "공식 이메일",
    },
  },
  en: {
    notice: "The 21 core areas are a long-term business plan and the 40 life categories are a content classification — not finished features. What the app launch is preparing is shown apart from what is planned.",
    stats: [["21", "Core business areas (long-term plan)"], ["40", "Life categories (content classification)"], ["34", "Life-event guides (app coming soon)"], ["228", "Life-topic guides (app coming soon)"]],
    seo: {
      overview: { title: "LIVON | NEWON — Services matched to life's moments", desc: "Moving, a first job, marriage, pregnancy and birth, military service, retirement — LIVON links life's big changes and everyday life with official information, checklists and plans. Free on the web today; the app is in preparation." },
      platform: { title: "LIVON Platform | 21 core areas and 40 life categories — NEWON", desc: "From Life Dashboard to military service, certificates and pregnancy: the users, problems, features and links of 21 core areas, life-event scenarios, trust principles, what works today and FAQ." },
      business: { title: "LIVON Business | Business model, revenue and roadmap — NEWON", desc: "Who uses and who pays, the B2C, B2B, B2B2C and B2G structure, subscription, connection and enterprise revenue models (all proposals), go-to-market, the P0–P7 roadmap and operating principles." },
      partnerships: { title: "LIVON Partnerships | Collaboration models and PoC proposals — NEWON", desc: "Collaboration models with HR and benefits teams, living services, education providers, local governments and public bodies, PoC proposals such as an employee life-benefit pilot, data and API principles and the process." },
      contact: { title: "LIVON Contact | Inquiries by purpose — NEWON", desc: "Personal use, employee benefits, living-service partnerships, public bodies, technology, media and investment inquiries — each explained and linked to NEWON's official contact channels." },
    },
    define: {
      kicker: "What is LIVON", title: "Services matched\nto life's moments.",
      lead: "LIVON is a life-event platform that connects life's big changes with everyday life. When something changes — moving, a first job, marriage, pregnancy and birth, military service, retirement — it brings official information, plans and checklists into one flow, and later connects checked living services too. The aim is simple: not to miss the moments that matter.",
      cols: ["The problem", "What people do today", "How LIVON does it"],
      rows: [["Information for each life event is scattered", "Search portals, blogs and agency sites one by one.", "Groups every related field around your life stage and event."], ["Knowing does not lead to doing", "Write things down in notes and calendars.", "Turns it into to-dos, dates and checklists, with applications linked to official channels."], ["Hard to tell what applies to you", "Compare age and region conditions by hand.", "Shows audience, region and date checked, and puts your own choices first."], ["Hard to choose a service you can trust", "Search results mixing ads and reviews.", "Later, links only checked partner services, with ads always labelled. (Planned)"]],
    },
    customers: {
      kicker: "Who it is for", title: "Who is LIVON for?", lead: "Individuals and families facing a life event come first; companies and institutions follow as customers who help them.",
      items: [["Individuals facing a life event", "People about to start work, move out, marry, have a baby, enlist or retire. The first focus is planned to be people in their 20s and 30s in the capital region preparing for a birth or a move."], ["Families", "Couples planning together, families expecting a baby, adult children caring for parents — households that share dates and paperwork."], ["HR and benefits teams", "Companies that want to explain company and public schemes when employees join, move, have a baby, care for family or retire (concept)."], ["Institutions and service partners", "Local governments and public bodies informing residents, and moving, cleaning or education providers who want to be found at the right moment (concept)."]],
    },
    diff: {
      kicker: "Why LIVON", title: "How is it different?", lead: "These are differentiation hypotheses based on how public services work, not yet tested against real usage data.",
      items: [["Public portals such as Gov24", "Strong at finding services and benefits. LIVON places those schemes inside the plans and checklists of a life event, and sends applications back to the official channel."], ["Search portals and blogs", "Plenty of information, but source, freshness and ads are hard to tell apart. LIVON adds the source and date checked, and always labels ads."], ["Calendar and notes apps", "Good for recording, silent on what to do when. LIVON shows what to check for each event first."]],
    },
    now: {
      kicker: "Service Status", title: "Where LIVON is today", lead: "As of October 2026. Planned features are never shown as operating.",
      groups: [
        ["now", "App Coming Soon — planned for the first app", [["Life Stage", "Topics, guides and checklists for seven stages, from the teens to 70+"], ["Life-event guides", "34 life-event guides and 228 life topics"], ["Today Feed", "Places, experiences and life guides"], ["My Life", "To-dos, plans, routines and notes — stored on your device only"], ["Official information", "17 official portals such as Bokjiro and Gov24, each with the date checked"]]],
        ["preparing", "In preparation", [["LIVON app V1", "Not released; no launch date is fixed."], ["Parts of Explore", "Some place and class information providers are under review."]]],
        ["planned", "Planned & under review", [["The 21 areas", "Military, certificate and birth plans and checklists, and more"], ["AI and personalisation", "Designed to separate official information from AI estimates"], ["Public community", "Only once moderation and reporting rules exist"], ["Living services and market", "After provider checks and payment and refund rules"], ["Paid plans and enterprise", "All proposals; no prices set"]]],
      ],
    },
    future: {
      kicker: "Long-term Vision", title: "Twenty-one core areas,\none whole life.", lead: "In the long run LIVON connects the 21 areas below in one platform, sharing one structure instead of building a separate app or server for each. They are not all available today.",
      prioTitle: "Priorities",
      prio: [["Life stage, 21 areas, dashboard", "LIVON's own identity: finding what you need now"], ["Event management incl. military, certificates, birth", "Plans, checklists, official information and personal records together"], ["Integrated AI and personalisation", "Testing everyday use and subscription value"], ["Living services, market, enterprise SaaS", "Real transactions and recurring revenue"], ["NEWON links and expansion", "Growing from proven core features"]],
      more: "See the 21 areas",
    },
    platform: {
      flowKicker: "How LIVON works", flowTitle: "From your situation\nto your record.", flowLead: "Every LIVON area moves through the same five steps. Finishing one life event becomes the starting point for the next.",
      areasKicker: "21 Core Areas", areasTitle: "21 core areas", areasLead: "The long-term areas of the final business plan. Each lists who it is for, the problem it addresses, its main features and what it connects to. They are not separate apps — they share one structure inside one LIVON.",
      f: { who: "For", problem: "The problem", features: "Main features (long-term plan)", connect: "Connects to", now: "App Coming Soon", plan: "Planned", cats: "Related life categories" },
      statusKicker: "Now & Next", statusTitle: "What the app launch is preparing, and what is planned", statusLead: "The current state of all 21 areas in one place. 'App Coming Soon' means some guides or basic tools for the area are planned for the first app — not that every feature is finished.",
      sgroups: { now: "App Coming Soon (partly) — guides and basic tools", partial: "Related guides only", planned: "Planned — not available yet", review: "Under review — legal and safety review first" },
      appRow: ["LIVON app V1", "In preparation · not released"],
      catsKicker: "40 Life Categories", catsTitle: "Content classification: five areas, forty life categories", catsLead: "The content classification that organises the actual guides beneath the 21 core areas. Choose a category for its topics, official sources and status. The number of categories is not a count of shipped features.",
      scnKicker: "Life-event Scenarios", scnTitle: "Six life-event scenarios", scnLead: "How LIVON is meant to be used, across six events — with what the first app will include kept apart from what comes later.", scnF: { who: "For", flow: "The flow", now: "App Coming Soon", later: "Later (planned)", areas: "Related areas" },
      usersKicker: "Who uses it how", usersTitle: "How each user type uses LIVON",
      users: [["Individuals", "App coming soon: browsing without an account, with notes kept on your device, is being prepared.", "Later: save to an account only if you want to; logging in is asked only for subscriptions or purchases."], ["Sellers and service providers", "Today: not provided; partnership inquiries only.", "Later: product, booking and customer tools (after provider checks)."], ["Education and content providers", "Today: content reviews and suggestions by inquiry.", "Later: courses, study materials and programmes."], ["Companies and institutions", "Today: partnership inquiries.", "Later: employee life benefits, information SaaS for institutions, partnerships."]],
      linkKicker: "How it connects", linkTitle: "How the features connect",
      links: [["Your situation groups the areas", "Choosing a life stage and event pulls every related area into one flow."], ["Dates gather in the dashboard", "Dates, deadlines and checklists saved in any area meet in Life Dashboard."], ["Official information first", "Schemes come with source, date checked and region; applications happen with each agency."], ["Services come last", "Living services, later, link only to checked partners, with ads and partnerships always labelled."], ["AI uses only what you allow (planned)", "Only records you permit, with official information kept apart from AI estimates."], ["Handing over to other NEWON apps", "Parenting to BABYLOG, pets to PETLOG, travel to MY WORLD, rental to SHAREON, care to ONGIL. There is no data link between the apps today, and later only items you agree to."]],
      trustKicker: "Privacy, Security & Trust", trustTitle: "Privacy, security and trust principles",
      trust: ["Anonymous browsing of public information, with no sign-up, is the default.", "Personal records in My Life are being prepared to stay only on your device.", "Life-stage, family, health and money data is kept to what is strictly needed.", "Logging in is asked only when an account is truly needed — sync, purchases, subscriptions. (Planned)", "No automatic sharing of user data with other NEWON apps.", "As a principle, nothing that identifies a person is handed to partners.", "Paid placements are labelled as ads or partnerships, and paid reviews are kept apart from real ones.", "AI answers show official sources and limits. (Planned)", "No military security information or unit locations are collected.", "Medical, legal, finance and property topics are general information and official channels only."],
      appKicker: "Using LIVON", appTitle: "Using LIVON",
      app: [["App Coming Soon", "LIVON app", "The LIVON app is being prepared for launch. It is planned to include Life Stage, life-event guides, Today Feed, My Life and official information."], ["In preparation: LIVON app", "Not released", "App V1 is in preparation. No launch date is fixed; it will be announced on this site."], ["Planned: five app tabs", "Home · Explore · AI · Community · My", "Designed to show only the fields you need at first and reveal more as your interests grow."]],
      faqKicker: "FAQ", faqTitle: "Frequently asked questions",
      faq: [["Is LIVON free right now?", "LIVON is preparing its app launch. There is no paid product on sale today; paid plans are proposals with no price set."], ["When is the LIVON app coming?", "The app is in preparation and no launch date is fixed. It will be announced on this site and NEWON's official channels."], ["Are all 21 areas available now?", "No. The 21 areas are a long-term plan. Guides and basic record tools for some areas are being prepared for the app launch — see the status board above, area by area."], ["How do the 21 areas differ from the 40 categories?", "The 21 areas group features and services as business units; the 40 categories organise the information guides. Each area card lists its related category numbers."], ["Will LIVON apply for benefits for me?", "No. LIVON helps you find and understand schemes, and links to each agency's official channel for applications and eligibility. There is no fee on benefit information."], ["Can I get financial, legal or property advice?", "LIVON gives general information and points to official advice services. It does not sell financial products, give investment advice, sell insurance, represent anyone legally or broker property."], ["Where are my notes stored?", "LIVON is preparing its app launch. Records are planned to stay on your device and not be sent to NEWON's servers."], ["Can I buy and sell used things?", "LIVON does not run personal used-goods trading. For sharing, rental and personal trading, please use NEWON's SHAREON."]],
    },
    business: {
      modelKicker: "Business Model", modelTitle: "Who uses it, and who pays?", modelLead: "LIVON's core life information stays free. Revenue is planned to come from individuals and families who want advanced features, companies running employee benefits, checked living-service partners and institutions. No paid product is on sale today.",
      structure: [["B2C · Individuals", "People facing a life event — free basics, advanced management and AI subscription (proposal)"], ["B2C · Families", "Couples and households caring for parents — shared family plan (proposal)"], ["C2C · Person to person", "Not run in LIVON. Sharing, rental and personal used-goods trading go to SHAREON."], ["B2B · Companies", "Companies running employee benefits — employee life benefits, enterprise SaaS (proposal)"], ["B2B2C · Service partners", "Moving, cleaning and education providers — referral and transaction fees (proposal, after provider checks and payments)"], ["B2G · Public bodies", "Resident information — SaaS and information-service contracts for institutions (proposal)"]],
      revKicker: "Revenue Models", revTitle: "Revenue models by type", revLead: "The 12 revenue models of the final business plan, plus event packages, public-sector SaaS and certificate-course partnerships, grouped by type. All are proposals not on sale; no rates or prices are set.",
      revCols: ["Model", "Who pays", "How", "Status"], revStatus: "Proposal · not on sale",
      plansKicker: "Subscription", plansTitle: "Subscription model (proposal)", plansLead: "Everything is free today. The tiers below are proposals in the business plan and are not on sale. Prices will be set only after AI, payment, server and support costs and real demand are known, and are not shown before then.",
      plans: [["Free", "App Coming Soon", "Life Stage, event guides, official information and on-device notes. Core life information stays free."], ["Plus", "Proposal", "Advanced records, statistics and life management."], ["Pro", "Proposal", "AI features, personalisation and extended management."], ["Family", "Proposal", "Shared family calendar and household management."]],
      plansBiz: "For businesses and sellers, tiered plans — from free listing through small, growth and advanced tiers to custom institutional contracts — are being considered as proposals.",
      feeKicker: "Transactions & Fees", feeTitle: "Principles for transaction, booking and referral revenue", feeLead: "Fees for living services, classes, everyday goods and education materials are not set, because payment, tax, refund and dispute costs are not yet verified. The principles by field are:",
      fees: [["Kept free", "Welfare and benefits, official military service information, basic certificate and exam information, official pregnancy and birth information"], ["Not introduced", "Fees proportional to medical bills"], ["On hold", "Performance fees for legal referrals"], ["Separate review", "Financial and insurance products by regulation and contract; property brokerage after legal review"], ["Decided after cost checks", "Referral fees for living services, classes, goods and education materials; safe payment for person-to-person trading"], ["No double fees", "Two NEWON platforms never both charge a fee on the same transaction."]],
      mktKicker: "Market & Opportunity", mktTitle: "The market problem and the opportunity",
      mkt: [["Scattered information", "What each life event needs is split across public portals, agency sites and blogs."], ["A gap between knowing and doing", "Even when people know a scheme, few tools turn it into dates, applications and the services they need."], ["Changes everyone goes through", "Work, moving out, marriage, birth and retirement happen to most adults. We do not present a money market size without evidence."]],
      diffTitle: "Differentiation hypotheses",
      diffs: [["Public portals (Gov24 and others)", "Scheme search → LIVON places schemes inside a life event's plans and checklists and links applications to official channels"], ["Search portals and blogs", "Source, freshness and ads are hard to tell → source, date checked and ad labels"], ["Calendar and notes apps", "Recording → shows what to check for each event first"], ["Other NEWON apps", "A hub that hands over at the right moment instead of copying specialist features"]],
      gtmKicker: "Go-to-market", gtmTitle: "Entering the market (plan)",
      gtm: [["A free information habit", "Search traffic for life events and shared checklists build a free-use habit."], ["Two events first", "People in their 20s and 30s in the capital region preparing for a birth or a move are the first audience, with deep content for them."], ["Testing subscription value", "After the app launches, price and conversion of individual and family plans are tested."], ["Employee-benefit pilots", "Small pilots are proposed to HR and benefits teams."]],
      roadTitle: "P0–P7, step by step.", roadLead: "Each step moves on only after it meets its completion criteria. Timing is a target that may move with legal review, payment contracts and store review — not a promise.",
      rulesExtra: ["Two NEWON platforms never both charge a fee on the same transaction.", "As a principle, nothing that identifies a person is handed to partners.", "Before any subscription, automatic payment and cancellation terms are explained clearly first."],
      ctaTitle: "Explore a business opportunity\nwith LIVON.", ctaLead: "Employee life benefits, information for institutions, living-service links — tell us through the NEWON Business inquiry.", ctaBiz: "Enterprise inquiry", ctaPartner: "See partnerships",
    },
    partnerships: {
      visionKicker: "Collaboration Vision", visionTitle: "Checked information and services,\nat the moment they are needed.", visionLead: "LIVON wants people to meet accurate information and services they can trust as they pass life's turning points. Companies and institutions gain a route to the people who need them at that moment. Everything below is a proposal; no agreements are signed and no pilots are running today.",
      vision: [["User value first", "Every collaboration starts with whether it really helps users."], ["Transparent labels", "Sources, ads and partnerships are always shown apart."], ["Start small, then test", "Narrow pilots first, judged by their results."]],
      modelsKicker: "Collaboration Models", modelsTitle: "Collaboration models", modelsF: { who: "Partners", what: "What we would do", value: "Value for the partner", cond: "Conditions" },
      models: [
        ["Employee life benefits", "HR and benefits teams", "Company and public schemes in one flow when employees join, move, marry, have a baby, care for family or retire.", "Expected to raise use of benefits and reduce repeated questions.", "Minimal employee data; designed so the company cannot see an individual employee's situation."],
        ["Living-service links", "Moving, cleaning, tidying and repair providers", "Checked providers shown at the right step of a moving or move-in checklist.", "A route to users at the moment they need the service.", "Starts only after provider checks, price and review display, and payment and refund rules; ads always labelled."],
        ["Education and certificates", "Education providers, exam and course platforms", "Courses and materials shown beside exam dates and study plans.", "Meeting learners just as they start preparing.", "Official exam dates first; no wording that promises a pass."],
        ["Public life information", "Local governments and public bodies", "Guidance built around residents' life events, such as moving in, a birth or settling as a young adult.", "Schemes explained clearly to the residents who need them.", "Public procurement and agreements followed; sources shown."],
        ["Finance, insurance and life platforms", "HR, finance, insurance and life-app businesses", "General financial-literacy content, labelled ads and possible technical links, under review.", "An information touchpoint in the context of life events.", "LIVON never solicits, sells or brokers products; regulatory review comes first."],
      ],
      pocKicker: "PoC & Pilot Proposals", pocTitle: "PoC and pilot proposals", pocLead: "Starting points worth testing. Scope and timing are examples, set by agreement and by how ready the app and account features are.", pocF: { scope: "Scope", period: "Duration (example)", measure: "What we would measure", cond: "Preconditions" },
      pocs: [
        ["Employee life-benefit PoC", "Linking the company and public schemes employees need when they move, have a baby or care for family — guidance and checklists for three events, with company schemes marked.", "8–12 weeks", "Checklist use, anonymous satisfaction survey, change in repeated HR questions", "Contract and data-processing agreement; employees' personal records cannot be seen by the company"],
        ["Local life-event guidance pilot", "One or two events — moving in, a birth, settling as a young adult — with local schemes and their sources.", "3–6 months", "Guide use, share of visits moving on to official application pages, error reports", "Public procurement and agreement; how local schemes are kept current"],
        ["Living-service link pilot", "Checked providers shown at the moving and move-in cleaning steps in one area.", "To be agreed once providers and payments are ready", "Number of referrals, reviews, disputes and refunds", "Provider checks, payment agent and refund rules, legal review completed"],
      ],
      dataKicker: "Data & API", dataTitle: "Data and API possibilities", dataLead: "LIVON offers no external API today. Below are the possibilities under review and their principles.",
      data: ["LIVON is preparing its app launch to use official portal information and some public data in its guides; some providers are under review.", "Under review: licensing life-event guidance content to companies and institutions", "Under review: exchanging scheme and date information with institutions' systems", "Under review: handing over only the items a user agrees to, to other NEWON apps", "Principle: consent-based, minimal collection, aggregated information only where needed — nothing that identifies a person is provided.", "Principle: access rights, security and processing contracts are agreed before any link."],
      campKicker: "Joint Services & Campaigns", campTitle: "Joint services and campaigns (proposals)",
      camps: [["Co-made life-event checklists", "The institution reviews the content; LIVON designs the flow."], ["Seasonal guidance", "Timed for school entry, moving season, year-end tax and discharge."], ["Public-interest campaigns", "Bringing little-known support schemes to the people who need them."], ["Brand-sponsored content", "Information content for life events — always labelled as advertising."]],
      valueKicker: "Expected Value", valueTitle: "What partners can expect",
      values: [["Companies", "Benefits employees actually notice and use"], ["Living-service providers", "A touchpoint with users at the moment of need"], ["Education providers", "Meeting learners as they start"], ["Local and public bodies", "A clear route for explaining schemes"]],
      ctaSecond: "NEWON Business inquiry",
    },
    contact: {
      purposeKicker: "Inquiry Guide", purposeTitle: "Inquiries by purpose", purposeLead: "Choosing the right channel gets you a faster answer. Every link goes to NEWON's existing official contact channels.",
      privacy: "Please do not include personal or sensitive information the answer does not need — ID numbers, health history, bank accounts or sensitive family circumstances. Your name, a contact for the reply and your question are enough.",
      f: { what: "For", include: "Helpful to include", go: "Contact" },
      items: [
        ["personal", "Personal use", "News about the app launch, or reporting an information error.", "The screen or topic, and for an error the official source"],
        ["feature", "Features & usage", "When My Life, Life Stage or an event guide does not work as expected.", "Device and browser, which screen and what went wrong"],
        ["welfare", "Employee-benefit partnership", "An employee life-benefit PoC or introducing life-event guidance for staff.", "Company size, events of interest (moving, birth, care), preferred timing"],
        ["service", "Living-service partnership", "Proposals from moving, cleaning, tidying or education providers.", "Service type and area, business details, how the service is delivered"],
        ["public", "Public bodies & local government", "Resident information, life-event pilots, reviewing public information.", "Organisation, target residents and events, procedure"],
        ["tech", "Technology & API", "Data or content links, connecting with institutional systems.", "What information and how, security requirements"],
        ["media", "Press & media", "Coverage, interviews, press material.", "Outlet, deadline, the gist of your questions"],
        ["invest", "Investment", "Investment-related questions about NEWON and the LIVON business.", "Affiliation, area of interest, preferred meeting format"],
      ],
      mailNote: "Official email",
    },
  },
};

/* existing official destinations for the contact purposes (no new form) */
export const CONTACT_PURPOSE_HREF = {
  personal: (l) => `/${l}/contact/?type=support`,
  feature: (l) => `/${l}/contact/?type=support`,
  welfare: (l) => `/${l}/business/contact/?type=saas&platform=livon`,
  service: (l) => `/${l}/business/contact/?type=participation&platform=livon`,
  public: (l) => `/${l}/business/contact/?type=public&platform=livon`,
  tech: (l) => `/${l}/business/contact/?type=technology&platform=livon`,
  media: (l) => `/${l}/contact/?type=media`,
  invest: () => "mailto:newon@newon.app",
};
export const CONTACT_PURPOSE_ICON = { personal: "person", feature: "chat", welfare: "users", service: "home", public: "building", tech: "link", media: "doc", invest: "coin" };

export function c30(lang) {
  return lang === "ko" ? C30.ko : C30.en;
}
