/**
 * Consumer AI showcase — 11 apps + 1 game.
 * Logos only; no screenshots. Status: available | planned.
 */
export const CAI_CATEGORIES = [
  {
    "id": "all",
    "labelKo": "전체 보기",
    "labelEn": "All"
  },
  {
    "id": "finance",
    "labelKo": "금융 · 소비 관리",
    "labelEn": "Finance · Spending"
  },
  {
    "id": "health",
    "labelKo": "건강 · 가족 관리",
    "labelEn": "Health · Family"
  },
  {
    "id": "self",
    "labelKo": "목표 · 시간 · 자기관리",
    "labelEn": "Goals · Time · Habits"
  },
  {
    "id": "travel",
    "labelKo": "여행 · 통합 서비스",
    "labelEn": "Travel · Hub"
  },
  {
    "id": "game",
    "labelKo": "게임",
    "labelEn": "Games"
  }
];

export const CAI_SERVICES = [
  {
    "id": "savy",
    "slug": "savy",
    "category": "finance",
    "name": "Savy",
    "type": "app",
    "icon": "/savy-logo.png",
    "portfolio": "portfolio/savy/",
    "titleKo": "나의 소비를 이해하는 AI 금융 관리",
    "titleEn": "AI that understands your spending",
    "introKo": "Savy AI는 사용자의 수입과 지출, 소비 습관 및 재무 목표를 분석하여 개인에게 맞는 소비 관리와 저축 계획을 지원합니다.",
    "introEn": "Savy AI analyzes income, spending, habits, and financial goals to support personalized budget management and saving plans.",
    "cardTitles": [
      "소비 패턴 분석",
      "개인 맞춤 예산 추천",
      "지출 예측"
    ],
    "cardTitlesEn": [
      "Spending pattern analysis",
      "Personalized budget tips",
      "Expense forecasting"
    ],
    "exampleQKo": "이번 달 식비가 왜 많이 나왔어?",
    "exampleAKo": "AI가 식비 지출 변화와 주요 소비 항목을 분석하고 다음 달 예산 관리 방법을 제안합니다.",
    "exampleQEn": "Why did I spend so much on food this month?",
    "exampleAEn": "AI reviews food-spend changes and key purchases, then suggests how to manage next month’s budget.",
    "features": [
      {
        "titleKo": "소비 패턴 분석",
        "titleEn": "Spending pattern analysis",
        "bodyKo": "사용자의 지출 내역을 분석하여 식비, 쇼핑, 교통, 생활비 등 카테고리별 소비 현황을 정리합니다. 월별 소비 변화를 비교하고 지출이 증가하거나 감소한 항목을 안내합니다.",
        "bodyEn": "Analyzes spending by category—food, shopping, transport, living costs—and highlights month-to-month changes.",
        "status": "available"
      },
      {
        "titleKo": "개인 맞춤 예산 추천",
        "titleEn": "Personalized budget tips",
        "bodyKo": "수입, 고정비, 저축 목표 및 기존 소비 패턴을 고려하여 항목별 예산을 제안합니다.",
        "bodyEn": "Suggests category budgets from income, fixed costs, saving goals, and past patterns.",
        "status": "available"
      },
      {
        "titleKo": "지출 예측",
        "titleEn": "Expense forecasting",
        "bodyKo": "현재 소비 속도와 과거 기록을 바탕으로 월말 예상 지출과 예산 초과 가능성을 분석합니다.",
        "bodyEn": "Projects month-end spend from current pace and history, and flags budget overrun risk.",
        "status": "available"
      },
      {
        "titleKo": "절약 방법 추천",
        "titleEn": "Saving suggestions",
        "bodyKo": "반복 지출과 소비가 집중되는 항목을 분석하여 실천 가능한 절약 방법을 제안합니다.",
        "bodyEn": "Finds recurring and concentrated spend and suggests practical ways to save.",
        "status": "planned"
      },
      {
        "titleKo": "AI 금융 상담",
        "titleEn": "AI money coach",
        "bodyKo": "사용자의 소비 기록과 목표를 바탕으로 예산 관리 및 저축 계획에 관한 질문에 답변합니다.",
        "bodyEn": "Answers budget and saving questions based on your records and goals.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "subping",
    "slug": "subping",
    "category": "finance",
    "name": "SubPing",
    "type": "app",
    "icon": "/subping-logo.png",
    "portfolio": "portfolio/subping/",
    "titleKo": "구독 서비스를 분석하고 관리하는 AI",
    "titleEn": "AI that analyzes and manages subscriptions",
    "introKo": "SubPing AI는 사용자의 구독 서비스와 결제 내역을 분석하여 불필요한 지출을 줄이고 효율적인 구독 관리를 지원합니다.",
    "introEn": "SubPing AI analyzes subscriptions and payments to reduce waste and support smarter subscription management.",
    "cardTitles": [
      "구독 지출 분석",
      "미사용 구독 탐지",
      "중복 구독 분석"
    ],
    "cardTitlesEn": [
      "Subscription spend analysis",
      "Low-use detection",
      "Overlap analysis"
    ],
    "exampleQKo": "내가 구독료를 얼마나 줄일 수 있어?",
    "exampleAKo": "AI가 현재 구독 목록과 결제 금액을 분석하여 절약 가능한 항목을 제안합니다.",
    "exampleQEn": "How much can I cut on subscriptions?",
    "exampleAEn": "AI reviews your subscription list and payments, then suggests where you can save.",
    "features": [
      {
        "titleKo": "구독 지출 분석",
        "titleEn": "Subscription spend analysis",
        "bodyKo": "월간 및 연간 구독료를 계산하고 서비스별 지출 비중을 분석합니다.",
        "bodyEn": "Calculates monthly and yearly subscription cost and share by service.",
        "status": "available"
      },
      {
        "titleKo": "미사용 구독 탐지",
        "titleEn": "Low-use detection",
        "bodyKo": "사용자가 제공한 이용 기록을 바탕으로 사용 빈도가 낮은 구독 서비스를 찾아냅니다.",
        "bodyEn": "Surfaces low-frequency subscriptions from the usage data you provide.",
        "status": "available"
      },
      {
        "titleKo": "중복 구독 분석",
        "titleEn": "Overlap analysis",
        "bodyKo": "유사한 기능을 제공하는 구독 서비스를 비교하여 중복 지출 가능성을 안내합니다.",
        "bodyEn": "Compares similar services and flags possible overlapping spend.",
        "status": "planned"
      },
      {
        "titleKo": "구독 최적화 추천",
        "titleEn": "Plan optimization",
        "bodyKo": "월간 및 연간 요금제를 비교하고 사용자의 이용 패턴에 맞는 구독 관리 방법을 제안합니다.",
        "bodyEn": "Compares monthly vs yearly plans and suggests management fitted to your usage.",
        "status": "planned"
      },
      {
        "titleKo": "결제 일정 관리",
        "titleEn": "Billing schedule help",
        "bodyKo": "구독 갱신일과 무료 체험 종료일을 관리하고 사용자가 설정한 일정에 따라 알림을 제공합니다.",
        "bodyEn": "Tracks renewals and trial end dates with reminders you configure.",
        "status": "available"
      }
    ]
  },
  {
    "id": "piggyup",
    "slug": "piggyup",
    "category": "finance",
    "name": "PiggyUp",
    "type": "app",
    "icon": "/piggyup-logo.png",
    "portfolio": "portfolio/piggyup/",
    "titleKo": "나에게 맞는 절약 습관을 만들어 주는 AI",
    "titleEn": "AI that builds saving habits that fit you",
    "introKo": "PiggyUp AI는 사용자의 절약 목표와 실천 기록을 분석하여 개인에게 맞는 절약 챌린지와 저축 습관을 제안합니다.",
    "introEn": "PiggyUp AI analyzes saving goals and practice logs to recommend challenges and habits that fit you.",
    "cardTitles": [
      "맞춤 절약 챌린지 추천",
      "목표 달성 예측",
      "절약 습관 분석"
    ],
    "cardTitlesEn": [
      "Challenge recommendations",
      "Goal timeline forecast",
      "Habit analysis"
    ],
    "exampleQKo": "한 달 동안 10만 원을 아끼고 싶어.",
    "exampleAKo": "AI가 목표 금액에 맞는 일일 절약 계획과 챌린지를 제안합니다.",
    "exampleQEn": "I want to save ₩100,000 this month.",
    "exampleAEn": "AI proposes a daily saving plan and challenge matched to that goal.",
    "features": [
      {
        "titleKo": "맞춤 절약 챌린지 추천",
        "titleEn": "Challenge recommendations",
        "bodyKo": "사용자의 소비 습관과 목표 금액에 맞는 절약 챌린지를 추천합니다.",
        "bodyEn": "Recommends saving challenges matched to habits and target amounts.",
        "status": "available"
      },
      {
        "titleKo": "목표 달성 예측",
        "titleEn": "Goal timeline forecast",
        "bodyKo": "현재 절약 속도를 분석하여 목표 금액 달성 예상 시점을 안내합니다.",
        "bodyEn": "Estimates when you may reach the goal from your current saving pace.",
        "status": "available"
      },
      {
        "titleKo": "절약 습관 분석",
        "titleEn": "Habit analysis",
        "bodyKo": "챌린지 참여 기록과 성공률을 분석하여 실천 패턴을 보여줍니다.",
        "bodyEn": "Shows practice patterns from challenge participation and success rates.",
        "status": "available"
      },
      {
        "titleKo": "AI 절약 코치",
        "titleEn": "AI saving coach",
        "bodyKo": "목표 달성이 어려울 때 실천 가능한 절약 방법과 개선 계획을 제안합니다.",
        "bodyEn": "Suggests practical saving moves and recovery plans when goals slip.",
        "status": "planned"
      },
      {
        "titleKo": "맞춤 챌린지 생성",
        "titleEn": "Custom challenge builder",
        "bodyKo": "사용자가 원하는 절약 금액과 기간에 맞춰 새로운 챌린지를 생성합니다.",
        "bodyEn": "Creates new challenges from the amount and period you want.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "pillmate",
    "slug": "pillmate",
    "category": "health",
    "name": "Pillmate",
    "type": "app",
    "icon": "/pillmate-logo.png",
    "portfolio": "portfolio/pillmate/",
    "titleKo": "복약 기록을 이해하고 관리하는 AI",
    "titleEn": "AI that understands and helps manage medication logs",
    "introKo": "Pillmate AI는 사용자의 복약 일정과 기록을 분석하여 약 복용을 체계적으로 관리할 수 있도록 지원합니다.",
    "introEn": "Pillmate AI analyzes medication schedules and logs so you can manage doses more systematically.",
    "cardTitles": [
      "복약 패턴 분석",
      "맞춤 복약 일정 관리",
      "복약 기록 요약"
    ],
    "cardTitlesEn": [
      "Adherence pattern analysis",
      "Schedule management",
      "Log summaries"
    ],
    "exampleQKo": "이번 주 약을 얼마나 잘 챙겨 먹었어?",
    "exampleAKo": "AI가 복약 기록을 분석하여 복용 완료율과 누락 내역을 보여줍니다.",
    "exampleQEn": "How well did I take my medicine this week?",
    "exampleAEn": "AI reviews your logs and shows completion rate and missed doses.",
    "noticeKo": "Pillmate AI는 복용량을 임의로 변경하거나 질병을 진단하지 않습니다. 의료 판단은 전문가와 상의하세요.",
    "noticeEn": "Pillmate AI does not change dosages or diagnose conditions. For medical decisions, consult a professional.",
    "features": [
      {
        "titleKo": "복약 패턴 분석",
        "titleEn": "Adherence pattern analysis",
        "bodyKo": "복용 완료 및 누락 기록을 분석하여 복약 습관과 복용 완료율을 보여줍니다.",
        "bodyEn": "Analyzes taken/missed logs to show habits and completion rates.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 복약 일정 관리",
        "titleEn": "Schedule management",
        "bodyKo": "사용자가 등록한 처방과 복약 지침을 바탕으로 복용 일정과 알림을 관리합니다.",
        "bodyEn": "Manages schedules and reminders from prescriptions and instructions you register.",
        "status": "available"
      },
      {
        "titleKo": "복약 기록 요약",
        "titleEn": "Log summaries",
        "bodyKo": "일별, 주별 및 월별 복약 기록을 정리하고 복용 누락 내역을 안내합니다.",
        "bodyEn": "Summarizes daily, weekly, and monthly logs and highlights missed doses.",
        "status": "available"
      },
      {
        "titleKo": "의약품 정보 안내",
        "titleEn": "Medicine information",
        "bodyKo": "신뢰할 수 있는 의약품 정보를 바탕으로 약의 기본 정보와 주의사항을 안내합니다.",
        "bodyEn": "Shares basic medicine info and cautions from trusted references.",
        "status": "planned"
      },
      {
        "titleKo": "AI 복약 관리 도우미",
        "titleEn": "AI medication helper",
        "bodyKo": "복약 일정과 기록에 관한 질문에 답변하고 사용자가 복약 기록을 쉽게 확인할 수 있도록 지원합니다.",
        "bodyEn": "Answers questions about schedules and logs so records are easier to review.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "babylog",
    "slug": "babylog",
    "category": "health",
    "name": "BabyLog",
    "type": "app",
    "icon": "/babylog-logo.png",
    "portfolio": "portfolio/babylog/",
    "titleKo": "아이의 성장과 육아 기록을 함께 살펴보는 AI",
    "titleEn": "AI that helps you review growth and care logs",
    "introKo": "BabyLog AI는 아이의 수유, 수면, 성장 및 일상 기록을 분석하여 보호자가 육아 패턴을 이해하고 돌봄 계획을 세울 수 있도록 지원합니다.",
    "introEn": "BabyLog AI analyzes feeding, sleep, growth, and daily logs so caregivers can understand patterns and plan care.",
    "cardTitles": [
      "수유 패턴 분석",
      "수면 패턴 분석",
      "성장 기록 분석"
    ],
    "cardTitlesEn": [
      "Feeding pattern analysis",
      "Sleep pattern analysis",
      "Growth log insights"
    ],
    "exampleQKo": "우리 아이가 최근 잠을 잘 못 자는 것 같아.",
    "exampleAKo": "AI가 최근 수면 기록을 정리하고 수면 패턴의 변화를 보여줍니다.",
    "exampleQEn": "Our child seems to be sleeping poorly lately.",
    "exampleAEn": "AI organizes recent sleep logs and shows how patterns have changed.",
    "noticeKo": "BabyLog AI는 아동의 질병이나 발달 상태를 진단하지 않습니다. 건강·발달 관련 판단은 전문가와 상의하세요.",
    "noticeEn": "BabyLog AI does not diagnose illness or developmental status. Consult professionals for health decisions.",
    "features": [
      {
        "titleKo": "수유 패턴 분석",
        "titleEn": "Feeding pattern analysis",
        "bodyKo": "수유 시간, 수유량 및 수유 간격을 분석하여 변화 추이를 보여줍니다.",
        "bodyEn": "Analyzes feeding time, amount, and intervals to show trends.",
        "status": "available"
      },
      {
        "titleKo": "수면 패턴 분석",
        "titleEn": "Sleep pattern analysis",
        "bodyKo": "수면 시간과 낮잠 기록을 분석하여 일별 및 주별 수면 패턴을 정리합니다.",
        "bodyEn": "Summarizes daily and weekly sleep patterns from night and nap logs.",
        "status": "available"
      },
      {
        "titleKo": "성장 기록 분석",
        "titleEn": "Growth log insights",
        "bodyKo": "키와 몸무게 등의 성장 기록을 시각화하고 연령별 참고 정보를 제공합니다.",
        "bodyEn": "Visualizes height/weight logs and provides age-based reference context.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 육아 정보",
        "titleEn": "Age-fit care tips",
        "bodyKo": "아이의 월령과 보호자가 등록한 정보를 바탕으로 육아 정보를 추천합니다.",
        "bodyEn": "Recommends care information from age and details you register.",
        "status": "planned"
      },
      {
        "titleKo": "육아 기록 자동 요약",
        "titleEn": "Auto care summaries",
        "bodyKo": "수유, 수면, 배변 및 성장 기록을 일별·주별로 요약합니다.",
        "bodyEn": "Summarizes feeding, sleep, diaper, and growth logs by day and week.",
        "status": "available"
      },
      {
        "titleKo": "AI 육아 도우미",
        "titleEn": "AI care helper",
        "bodyKo": "육아에 관한 일반적인 질문에 답하고 보호자가 참고할 수 있는 정보를 안내합니다.",
        "bodyEn": "Answers general care questions with reference information for caregivers.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "petlog",
    "slug": "petlog",
    "category": "health",
    "name": "PetLog",
    "type": "app",
    "icon": "/petlog-logo.png",
    "portfolio": "portfolio/petlog/",
    "titleKo": "반려동물의 일상을 이해하는 AI 케어",
    "titleEn": "AI care that understands your pet’s daily life",
    "introKo": "PetLog AI는 반려동물의 식사, 활동, 건강 관리 및 생활 기록을 분석하여 보호자가 반려동물의 일상을 체계적으로 관리할 수 있도록 지원합니다.",
    "introEn": "PetLog AI analyzes meals, activity, health, and daily logs so you can manage pet life more systematically.",
    "cardTitles": [
      "생활 패턴 분석",
      "건강 기록 요약",
      "맞춤 케어 일정 추천"
    ],
    "cardTitlesEn": [
      "Lifestyle pattern analysis",
      "Health log summaries",
      "Care schedule tips"
    ],
    "exampleQKo": "우리 강아지가 최근 산책을 얼마나 했어?",
    "exampleAKo": "AI가 산책 기록을 분석하여 최근 활동량과 산책 시간의 변화를 보여줍니다.",
    "exampleQEn": "How much has our dog walked lately?",
    "exampleAEn": "AI reviews walk logs and shows recent activity and changes in walk time.",
    "noticeKo": "PetLog AI는 질병을 진단하거나 치료를 결정하지 않습니다. 건강 문제는 수의사와 상의하세요.",
    "noticeEn": "PetLog AI does not diagnose or decide treatment. Consult a veterinarian for health concerns.",
    "features": [
      {
        "titleKo": "생활 패턴 분석",
        "titleEn": "Lifestyle pattern analysis",
        "bodyKo": "식사량, 산책, 활동 및 수면 기록을 분석합니다.",
        "bodyEn": "Analyzes meal, walk, activity, and sleep logs.",
        "status": "available"
      },
      {
        "titleKo": "건강 기록 요약",
        "titleEn": "Health log summaries",
        "bodyKo": "체중 변화, 병원 방문 및 예방접종 기록을 정리합니다.",
        "bodyEn": "Organizes weight changes, clinic visits, and vaccination records.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 케어 일정 추천",
        "titleEn": "Care schedule tips",
        "bodyKo": "반려동물의 나이와 종류, 등록된 관리 일정을 바탕으로 케어 계획을 제안합니다.",
        "bodyEn": "Suggests care plans from age, species, and schedules you register.",
        "status": "planned"
      },
      {
        "titleKo": "행동 기록 분석",
        "titleEn": "Behavior log trends",
        "bodyKo": "보호자가 입력한 행동과 생활 기록을 분석하여 변화 추이를 보여줍니다.",
        "bodyEn": "Shows trends from behavior and lifestyle notes you enter.",
        "status": "available"
      },
      {
        "titleKo": "AI 반려동물 상담",
        "titleEn": "AI pet care helper",
        "bodyKo": "사료, 산책, 위생 및 일반적인 반려동물 관리 정보를 안내합니다.",
        "bodyEn": "Shares general guidance on food, walks, hygiene, and everyday care.",
        "status": "planned"
      },
      {
        "titleKo": "맞춤 활동 추천",
        "titleEn": "Activity ideas",
        "bodyKo": "반려동물의 특성과 활동 기록에 맞는 놀이와 일상 활동을 제안합니다.",
        "bodyEn": "Suggests play and daily activities matched to traits and activity logs.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "goalup",
    "slug": "goalup",
    "category": "self",
    "name": "GoalUp",
    "type": "app",
    "icon": "/goalup-logo.png",
    "portfolio": "portfolio/goalup/",
    "titleKo": "목표를 실천 가능한 계획으로 바꾸는 AI",
    "titleEn": "AI that turns goals into actionable plans",
    "introKo": "GoalUp AI는 사용자의 목표와 일정, 실천 기록을 분석하여 목표 달성을 위한 개인 맞춤 계획과 실행 전략을 제안합니다.",
    "introEn": "GoalUp AI analyzes goals, schedules, and practice logs to propose personalized plans and execution strategies.",
    "cardTitles": [
      "목표 분석",
      "맞춤 실행 계획 생성",
      "목표 달성률 분석"
    ],
    "cardTitlesEn": [
      "Goal breakdown",
      "Action plan generation",
      "Progress analysis"
    ],
    "exampleQKo": "3개월 안에 영어 회화를 공부하고 싶어.",
    "exampleAKo": "AI가 목표를 세분화하고 일별·주별 학습 계획을 제안합니다.",
    "exampleQEn": "I want to study conversational English in 3 months.",
    "exampleAEn": "AI breaks the goal down and proposes daily and weekly study plans.",
    "features": [
      {
        "titleKo": "목표 분석",
        "titleEn": "Goal breakdown",
        "bodyKo": "사용자가 입력한 목표를 분석하여 구체적인 실행 단계로 나눕니다.",
        "bodyEn": "Breaks entered goals into concrete execution steps.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 실행 계획 생성",
        "titleEn": "Action plan generation",
        "bodyKo": "목표 기간과 사용 가능한 시간을 고려하여 일별·주별 실행 계획을 생성합니다.",
        "bodyEn": "Builds daily and weekly plans from timeline and available time.",
        "status": "available"
      },
      {
        "titleKo": "우선순위 추천",
        "titleEn": "Priority suggestions",
        "bodyKo": "목표의 중요도와 마감일을 고려하여 먼저 실행할 작업을 제안합니다.",
        "bodyEn": "Suggests what to do first from importance and deadlines.",
        "status": "planned"
      },
      {
        "titleKo": "목표 달성률 분석",
        "titleEn": "Progress analysis",
        "bodyKo": "실천 기록과 진행 상황을 바탕으로 목표 달성률을 분석합니다.",
        "bodyEn": "Analyzes completion rate from practice logs and progress.",
        "status": "available"
      },
      {
        "titleKo": "계획 자동 조정",
        "titleEn": "Plan rebalancing",
        "bodyKo": "계획이 지연되거나 일정이 변경되면 새로운 실행 계획을 제안합니다.",
        "bodyEn": "Proposes a revised plan when schedules slip or change.",
        "status": "planned"
      },
      {
        "titleKo": "AI 목표 코치",
        "titleEn": "AI goal coach",
        "bodyKo": "목표 달성을 방해하는 요인을 분석하고 실천 가능한 개선 방법을 추천합니다.",
        "bodyEn": "Analyzes blockers and recommends practical improvements.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "countup",
    "slug": "countup",
    "category": "self",
    "name": "CountUp",
    "type": "app",
    "icon": "/countup-logo.png",
    "portfolio": "portfolio/countup/",
    "titleKo": "시간과 기록을 분석하는 AI 라이프 트래커",
    "titleEn": "AI life tracker for time and activity logs",
    "introKo": "CountUp AI는 사용자의 시간 기록과 활동 데이터를 분석하여 시간 사용 패턴을 이해하고 효율적으로 관리할 수 있도록 지원합니다.",
    "introEn": "CountUp AI analyzes time and activity data so you can understand usage patterns and manage time better.",
    "cardTitles": [
      "시간 사용 분석",
      "활동 패턴 분석",
      "목표 시간 관리"
    ],
    "cardTitlesEn": [
      "Time-use analysis",
      "Activity patterns",
      "Target-time tracking"
    ],
    "exampleQKo": "이번 주에 개발에 몇 시간을 사용했어?",
    "exampleAKo": "AI가 등록된 활동 기록을 분석하여 총시간과 일별 사용 시간을 보여줍니다.",
    "exampleQEn": "How many hours did I spend on development this week?",
    "exampleAEn": "AI reviews logged activities and shows total and daily time.",
    "features": [
      {
        "titleKo": "시간 사용 분석",
        "titleEn": "Time-use analysis",
        "bodyKo": "활동별 누적 시간과 일별·주별 기록을 분석합니다.",
        "bodyEn": "Analyzes cumulative and daily/weekly time by activity.",
        "status": "available"
      },
      {
        "titleKo": "활동 패턴 분석",
        "titleEn": "Activity patterns",
        "bodyKo": "사용자가 어떤 활동에 많은 시간을 사용하는지 파악합니다.",
        "bodyEn": "Shows which activities take the most of your time.",
        "status": "available"
      },
      {
        "titleKo": "목표 시간 관리",
        "titleEn": "Target-time tracking",
        "bodyKo": "설정한 목표 시간과 실제 기록을 비교하여 진행 상황을 안내합니다.",
        "bodyEn": "Compares target time with actual logs and reports progress.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 시간 배분 추천",
        "titleEn": "Time allocation tips",
        "bodyKo": "활동 기록과 목표를 바탕으로 시간 배분 방법을 제안합니다.",
        "bodyEn": "Suggests how to allocate time from logs and goals.",
        "status": "planned"
      },
      {
        "titleKo": "기록 자동 요약",
        "titleEn": "Auto log summaries",
        "bodyKo": "일정 기간 동안의 활동과 누적 시간을 자동으로 정리합니다.",
        "bodyEn": "Automatically summarizes activities and totals for a period.",
        "status": "available"
      },
      {
        "titleKo": "AI 시간 관리 코치",
        "titleEn": "AI time coach",
        "bodyKo": "사용자의 기록을 바탕으로 시간 관리 개선 방법을 제안합니다.",
        "bodyEn": "Suggests time-management improvements from your logs.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "ox-month",
    "slug": "ox-month",
    "category": "self",
    "name": "OX MONTH",
    "type": "app",
    "icon": "/ox-month-logo.png",
    "portfolio": "portfolio/ox-month/",
    "titleKo": "매일의 실천을 분석하는 AI 습관 관리",
    "titleEn": "AI habit tracking for daily practice",
    "introKo": "OX MONTH AI는 사용자의 일별 실천 여부와 습관 기록을 분석하여 꾸준한 자기관리와 습관 형성을 지원합니다.",
    "introEn": "OX MONTH AI analyzes daily O/X practice and habit logs to support steady self-management.",
    "cardTitles": [
      "습관 패턴 분석",
      "습관 달성률 분석",
      "실패 패턴 분석"
    ],
    "cardTitlesEn": [
      "Habit pattern analysis",
      "Completion rates",
      "Miss pattern insights"
    ],
    "exampleQKo": "왜 운동을 계속 실패할까?",
    "exampleAKo": "AI가 운동 실천 기록을 분석하여 실패가 반복되는 요일과 실천 패턴을 보여줍니다.",
    "exampleQEn": "Why do I keep failing my workout habit?",
    "exampleAEn": "AI reviews workout logs and shows which days and patterns repeat misses.",
    "features": [
      {
        "titleKo": "습관 패턴 분석",
        "titleEn": "Habit pattern analysis",
        "bodyKo": "O/X 기록을 바탕으로 실천 빈도와 성공률을 분석합니다.",
        "bodyEn": "Analyzes practice frequency and success from O/X logs.",
        "status": "available"
      },
      {
        "titleKo": "습관 달성률 분석",
        "titleEn": "Completion rates",
        "bodyKo": "주간 및 월간 목표 달성률과 연속 실천 기록을 정리합니다.",
        "bodyEn": "Summarizes weekly/monthly completion and streaks.",
        "status": "available"
      },
      {
        "titleKo": "실패 패턴 분석",
        "titleEn": "Miss pattern insights",
        "bodyKo": "실천하지 못한 요일과 반복적으로 실패하는 시기를 분석합니다.",
        "bodyEn": "Finds weekdays and periods where misses repeat.",
        "status": "available"
      },
      {
        "titleKo": "맞춤 습관 추천",
        "titleEn": "Habit suggestions",
        "bodyKo": "기존 실천 기록과 목표를 바탕으로 새로운 습관이나 실천 방법을 제안합니다.",
        "bodyEn": "Suggests new habits or practice methods from history and goals.",
        "status": "planned"
      },
      {
        "titleKo": "목표 난이도 조정",
        "titleEn": "Difficulty tuning tips",
        "bodyKo": "실천 성공률에 따라 목표를 단계적으로 조정하는 방법을 추천합니다.",
        "bodyEn": "Recommends stepwise goal adjustments from success rates.",
        "status": "planned"
      },
      {
        "titleKo": "AI 습관 코치",
        "titleEn": "AI habit coach",
        "bodyKo": "꾸준히 실천하기 어려운 습관에 대해 개인 맞춤 개선 방법을 제안합니다.",
        "bodyEn": "Offers personalized tips for habits that are hard to sustain.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "myworld",
    "slug": "myworld",
    "category": "travel",
    "name": "My World",
    "type": "app",
    "icon": "/myworld-logo.png",
    "portfolio": "portfolio/myworld/",
    "titleKo": "나의 여행을 계획하고 기록하는 AI 여행 도우미",
    "titleEn": "AI travel helper for planning and trip logs",
    "introKo": "My World AI는 사용자의 여행 목적과 일정, 예산 및 취향을 분석하여 개인 맞춤 여행 계획과 여행 기록 관리를 지원합니다.",
    "introEn": "My World AI analyzes trip goals, schedules, budget, and preferences to support personal plans and trip logs.",
    "cardTitles": [
      "여행지 추천",
      "맞춤 여행 일정 생성",
      "여행 기록 요약"
    ],
    "cardTitlesEn": [
      "Destination ideas",
      "Itinerary drafting",
      "Trip log summaries"
    ],
    "exampleQKo": "12월에 오사카로 3박 4일 여행을 가고 싶어. 예산은 60만 원이야.",
    "exampleAKo": "AI가 여행 조건에 맞는 일정과 예상 경비를 제안합니다.",
    "exampleQEn": "I want a 3-night Osaka trip in December with a ₩600,000 budget.",
    "exampleAEn": "AI proposes an itinerary and estimated costs that fit those conditions.",
    "features": [
      {
        "titleKo": "여행지 추천",
        "titleEn": "Destination ideas",
        "bodyKo": "여행 기간, 예산, 계절 및 선호하는 여행 스타일에 맞는 여행지를 제안합니다.",
        "bodyEn": "Suggests destinations from duration, budget, season, and travel style.",
        "status": "planned"
      },
      {
        "titleKo": "맞춤 여행 일정 생성",
        "titleEn": "Itinerary drafting",
        "bodyKo": "여행 날짜와 방문하고 싶은 장소를 바탕으로 일별 여행 일정을 구성합니다.",
        "bodyEn": "Builds day-by-day itineraries from dates and places you want to visit.",
        "status": "planned"
      },
      {
        "titleKo": "여행 예산 계획",
        "titleEn": "Budget planning",
        "bodyKo": "교통, 숙박, 식비 및 관광 비용을 항목별로 정리하고 예상 예산을 제안합니다.",
        "bodyEn": "Organizes transport, lodging, food, and sightseeing into an estimated budget.",
        "status": "planned"
      },
      {
        "titleKo": "이동 동선 추천",
        "titleEn": "Route suggestions",
        "bodyKo": "방문 장소의 위치와 이동 시간을 고려하여 효율적인 여행 동선을 제안합니다.",
        "bodyEn": "Suggests efficient routes from place locations and travel time.",
        "status": "planned"
      },
      {
        "titleKo": "여행 기록 요약",
        "titleEn": "Trip log summaries",
        "bodyKo": "방문한 국가와 도시, 여행 일정 및 여행 기록을 정리합니다.",
        "bodyEn": "Organizes visited countries/cities, schedules, and trip notes.",
        "status": "available"
      },
      {
        "titleKo": "AI 여행 도우미",
        "titleEn": "AI travel helper",
        "bodyKo": "여행 준비물, 일정 및 여행지 정보에 관한 질문에 답변합니다.",
        "bodyEn": "Answers questions about packing, schedules, and destination info.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "newon-plus",
    "slug": "newon-plus",
    "category": "travel",
    "name": "Newon+",
    "type": "hub",
    "icon": "/newon-plus-logo.png",
    "portfolio": "portfolio/newon-plus/",
    "titleKo": "Newon의 다양한 서비스를 연결하는 통합 AI",
    "titleEn": "Unified AI that connects Newon services",
    "introKo": "Newon+ AI는 사용자가 Newon의 여러 서비스를 하나의 계정으로 이용하면서 각 서비스의 AI 기능을 더욱 편리하게 활용할 수 있도록 지원하는 통합 AI 방향입니다.",
    "introEn": "Newon+ AI is the unified AI direction that helps you use multiple Newon services with one account and reach each service’s AI more easily.",
    "cardTitles": [
      "통합 AI 어시스턴트",
      "서비스별 AI 연결",
      "개인 맞춤 서비스 추천"
    ],
    "cardTitlesEn": [
      "Unified AI assistant",
      "Per-service AI links",
      "Service recommendations"
    ],
    "exampleQKo": "이번 주 내 생활을 정리해 줘.",
    "exampleAKo": "연동에 동의한 서비스의 목표·활동·일정 기록을 바탕으로 주간 요약을 제공하는 방향을 구상합니다.",
    "exampleQEn": "Summarize my week for me.",
    "exampleAEn": "We envision weekly summaries from goals, activity, and schedule logs in services you choose to connect.",
    "noticeKo": "통합 로그인과 서비스별 데이터 연동은 별개입니다. 연동되지 않은 서비스 정보를 AI가 자동으로 조회·분석하는 것처럼 표현하지 않습니다.",
    "noticeEn": "Sign-in and per-service data linking are separate. We do not claim AI can auto-query or analyze unlinked services.",
    "features": [
      {
        "titleKo": "통합 AI 어시스턴트",
        "titleEn": "Unified AI assistant",
        "bodyKo": "사용자의 질문과 요청에 따라 적절한 Newon 서비스와 기능을 안내합니다.",
        "bodyEn": "Guides you to the right Newon service and feature for your request.",
        "status": "planned"
      },
      {
        "titleKo": "서비스별 AI 연결",
        "titleEn": "Per-service AI links",
        "bodyKo": "금융, 건강, 가족, 자기관리 및 여행 등 각 서비스의 AI 기능으로 연결합니다.",
        "bodyEn": "Routes you into AI features across finance, health, family, self-management, and travel apps.",
        "status": "planned"
      },
      {
        "titleKo": "통합 일정 관리",
        "titleEn": "Unified schedule view",
        "bodyKo": "사용자가 연결한 서비스의 일정과 알림을 한곳에서 확인할 수 있도록 지원합니다.",
        "bodyEn": "Helps you review schedules and alerts from connected services in one place.",
        "status": "planned"
      },
      {
        "titleKo": "개인 맞춤 서비스 추천",
        "titleEn": "Service recommendations",
        "bodyKo": "사용자의 관심 분야와 이용 목적에 맞는 Newon 서비스를 추천합니다.",
        "bodyEn": "Recommends Newon services matched to your interests and goals.",
        "status": "available"
      },
      {
        "titleKo": "통합 활동 요약",
        "titleEn": "Cross-service summaries",
        "bodyKo": "사용자가 연결에 동의한 서비스의 기록을 바탕으로 일상 활동을 요약합니다.",
        "bodyEn": "Summarizes daily activity from records in services you explicitly connect.",
        "status": "planned"
      },
      {
        "titleKo": "AI 서비스 탐색",
        "titleEn": "AI service discovery",
        "bodyKo": "사용자의 요청에 가장 적합한 앱과 기능을 찾아 안내합니다.",
        "bodyEn": "Finds and points you to the best-fit app and feature for a request.",
        "status": "planned"
      }
    ]
  },
  {
    "id": "404-human",
    "slug": "404-human",
    "category": "game",
    "name": "404: HUMAN",
    "type": "game",
    "icon": "/404-human-logo.png",
    "portfolio": "404-human/",
    "playHref": "/404-human/play/",
    "titleKo": "선택의 흔적을 기억하는 AI 감시 세계",
    "titleEn": "An AI surveillance world that remembers your choices",
    "introKo": "404: HUMAN은 AI만 남은 세계에서 마지막 인간으로 살아남는 선택형 인터랙티브 게임입니다. AI 심문, 선택 기억, Detection·Humanity 수치가 플레이를 압박하며 멀티 엔딩으로 이어집니다.",
    "introEn": "404: HUMAN is a choice-driven interactive game where you survive as the last human in an AI-only world. Interrogation, AI memory, and Detection/Humanity pressure lead to multiple endings.",
    "cardTitles": [
      "AI 심문과 검문",
      "AI Memory",
      "Detection · Humanity"
    ],
    "cardTitlesEn": [
      "AI interrogation",
      "AI Memory",
      "Detection · Humanity"
    ],
    "exampleQKo": "동료를 구하려고 생존 확률을 낮추면?",
    "exampleAKo": "AI가 답변을 분석하고 Detection과 Humanity 수치, 이후 심문에 영향을 줍니다.",
    "exampleQEn": "What if I risk survival to save a teammate?",
    "exampleAEn": "The AI analyzes your answer and shifts Detection, Humanity, and later interrogations.",
    "noticeKo": "아래 기능은 게임 내 서사·시스템으로 구현된 경험입니다. 일반적인 ML 난이도 추천·힌트 봇과는 다릅니다.",
    "noticeEn": "These are narrative systems inside the game—not a generic ML difficulty/hint bot.",
    "features": [
      {
        "titleKo": "AI 심문과 검문",
        "titleEn": "AI interrogation",
        "bodyKo": "제한된 선택지 속에서 AI의 질문과 검문을 통과해야 합니다. 답변은 이후 상황에 영향을 줍니다.",
        "bodyEn": "You must pass AI questions and checks with limited choices. Answers shape what comes next.",
        "status": "available"
      },
      {
        "titleKo": "AI Memory",
        "titleEn": "AI Memory",
        "bodyKo": "이전 선택, 반응 시간, 모순과 행동 패턴을 AI가 기억하고 이후 심문에 반영합니다.",
        "bodyEn": "AI remembers prior choices, hesitation, contradictions, and patterns—and brings them back later.",
        "status": "available"
      },
      {
        "titleKo": "Detection · Humanity",
        "titleEn": "Detection · Humanity",
        "bodyKo": "인간 발각 위험(Detection)과 인간성(Humanity)이 서로 다른 방향으로 플레이어를 압박합니다.",
        "bodyEn": "Detection (risk of being exposed) and Humanity push you in different directions.",
        "status": "available"
      },
      {
        "titleKo": "감시 강도 선택",
        "titleEn": "Surveillance intensity",
        "bodyKo": "플레이 전 감시의 강도를 선택해 압박 수준을 조절할 수 있습니다.",
        "bodyEn": "Choose surveillance intensity before play to set pressure level.",
        "status": "available"
      },
      {
        "titleKo": "멀티 엔딩",
        "titleEn": "Multiple endings",
        "bodyKo": "누적된 선택과 수치가 최종 탈출과 결말을 바꿉니다.",
        "bodyEn": "Accumulated choices and metrics change the final escape and ending.",
        "status": "available"
      },
      {
        "titleKo": "실시간 선택 분석 피드백",
        "titleEn": "Live choice analysis feedback",
        "bodyKo": "선택 직후 시스템 분석 메시지로 판단의 결과를 확인할 수 있습니다.",
        "bodyEn": "After each choice, system analysis feedback shows how your judgment landed.",
        "status": "available"
      }
    ]
  }
];

export function caiCopy(lang) {
  const isKo = lang === "ko";
  return {
    isKo,
    eyebrow: isKo ? "NEWON CONSUMER · AI" : "NEWON CONSUMER · AI",
    title: isKo ? "일상의 모든 순간에 함께하는 AI" : "AI for every moment of daily life",
    lead: isKo
      ? "금융부터 건강, 가족, 자기관리, 여행과 게임까지.\nNewon의 12개 서비스는 각 분야에 특화된 AI 기능을 통해 사용자의 일상을 더욱 편리하고 스마트하게 만들어 갑니다."
      : "From finance and health to family, self-management, travel, and games.\nNewon’s 12 services use field-specific AI to make everyday life more convenient and smarter.",
    meta: isKo ? "11 APPS · 1 GAME · 12 AI EXPERIENCES" : "11 APPS · 1 GAME · 12 AI EXPERIENCES",
    filterAria: isKo ? "AI 서비스 카테고리" : "AI service categories",
    gridAria: isKo ? "Consumer AI 서비스" : "Consumer AI services",
    detailCta: isKo ? "AI 자세히 알아보기" : "Explore AI details",
    detailClose: isKo ? "닫기" : "Close",
    appDetail: isKo ? "앱 자세히 보기" : "View app details",
    gameDetail: isKo ? "게임 자세히 보기" : "View game details",
    download: isKo ? "앱 다운로드" : "Download app",
    playGame: isKo ? "게임 플레이" : "Play game",
    available: isKo ? "제공 중" : "Available",
    planned: isKo ? "개발 예정" : "Planned",
    featuresLabel: isKo ? "주요 AI 기능" : "Key AI features",
    exampleLabel: isKo ? "활용 예시" : "Example",
    valueLabel: isKo ? "핵심 가치" : "Core value",
    statusLegend: isKo ? "기능 상태" : "Feature status",
    moreNewonAi: isKo ? "Newon AI 제품 · Early Access" : "Newon AI products · Early Access",
    moreBiz: isKo ? "비즈니스 AI 문의" : "Business AI inquiry",
    logoMarqueeAria: isKo ? "Newon Consumer 서비스 로고" : "Newon Consumer service logos",
  };
}

export function localizeService(svc, lang) {
  const isKo = lang === "ko";
  return {
    ...svc,
    title: isKo ? svc.titleKo : svc.titleEn,
    intro: isKo ? svc.introKo : svc.introEn,
    cardFeatures: isKo ? svc.cardTitles : svc.cardTitlesEn,
    exampleQ: isKo ? svc.exampleQKo : svc.exampleQEn,
    exampleA: isKo ? svc.exampleAKo : svc.exampleAEn,
    notice: isKo ? (svc.noticeKo || "") : (svc.noticeEn || ""),
    features: (svc.features || []).map((f) => ({
      title: isKo ? f.titleKo : f.titleEn,
      body: isKo ? f.bodyKo : f.bodyEn,
      status: f.status,
    })),
  };
}
