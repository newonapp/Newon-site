/* LIVON Life Event catalog — expandable project structure */
window.LivonLifeEvents = {
  "statusLabel": {
    "guide": "가이드",
    "info": "정보 안내",
    "link": "연결",
    "soon": "준비 중",
    "planned": "확장 예정"
  },
  "situationLabels": {
    "학생·진학": "대학·학업 중",
    "취업·이직": "취업·이직 준비 중",
    "독립·자취": "독립 준비·자취 중",
    "직장생활": "사회초년·직장 생활",
    "결혼·동거": "결혼·동거 준비 중",
    "임신·육아": "임신·육아 중",
    "가족 돌봄": "가족·부모 돌봄 중",
    "은퇴 준비": "은퇴 준비 중",
    "은퇴 후 생활": "은퇴 후 생활",
    "새로운 도전": "새로운 도전 중"
  },
  "events": [
    {
      "id": "enroll",
      "title": "입학",
      "blurb": "새 학교·학기 시작에 맞춰 일정과 준비를 정리합니다.",
      "stages": [
        "10",
        "20"
      ],
      "situations": [
        "학생·진학"
      ],
      "needs": [
        "학습 계획",
        "학교 생활",
        "지원 제도",
        "커뮤니티"
      ],
      "checklist": [
        "입학 일정·서류 확인",
        "통학·생활비 예산",
        "첫 학기 목표 3가지",
        "상담·멘토 창구 찾아두기"
      ],
      "resources": [
        {
          "label": "교육·학습 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "할 일로 저장",
          "href": "#life-now",
          "status": "guide"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#ml-todos",
        "community": "#community",
        "ai": "입학 준비 체크리스트를 만들어 줘."
      }
    },
    {
      "id": "advance",
      "title": "진학",
      "blurb": "다음 단계 진학을 위한 일정·전형·탐색을 모읍니다.",
      "stages": [
        "10",
        "20"
      ],
      "situations": [
        "학생·진학"
      ],
      "needs": [
        "진로",
        "교육",
        "상담",
        "일정 관리"
      ],
      "checklist": [
        "관심 전공·학교 정리",
        "전형·마감 일정 표",
        "체험·오픈캠퍼스",
        "상담 창구 확인"
      ],
      "resources": [
        {
          "label": "진로·교육 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "내 생활 · 목표",
          "href": "#ml-goals",
          "status": "guide"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "ai": "진학 준비 일정을 짜 줘."
      }
    },
    {
      "id": "graduate",
      "title": "졸업",
      "blurb": "졸업 이후 취업·진학·독립 갈래를 정리합니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [
        "학생·진학",
        "취업·이직",
        "독립·자취"
      ],
      "needs": [
        "커리어",
        "주거",
        "금융",
        "커뮤니티"
      ],
      "checklist": [
        "졸업·증명 서류 목록",
        "다음 경로 정하기",
        "생활비·저축 목표",
        "이력 업데이트"
      ],
      "resources": [
        {
          "label": "취업 지원 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "주거 가이드",
          "href": "#life",
          "status": "guide"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "졸업 후 3개월 계획을 세워 줘."
      }
    },
    {
      "id": "first-job",
      "title": "첫 취업",
      "blurb": "이력·면접·입사 준비를 단계별로 연결합니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [
        "취업·이직",
        "직장생활"
      ],
      "needs": [
        "채용 정보",
        "커리어 전문가",
        "교육",
        "자격증",
        "지원 제도",
        "커뮤니티"
      ],
      "checklist": [
        "이력서·포트폴리오 초안",
        "관심 직무·회사 리스트",
        "면접 Q&A 연습",
        "입사 서류·교통 체크"
      ],
      "resources": [
        {
          "label": "고용·자격 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "취업 준비 일정",
          "href": "#life-now",
          "status": "guide"
        },
        {
          "label": "커리어 커뮤니티",
          "href": "#community",
          "status": "link"
        },
        {
          "label": "실시간 채용 매칭",
          "href": "#explore",
          "status": "soon"
        }
      ],
      "links": {
        "explore": "#ex-experts",
        "lifeNow": "#life-now",
        "community": "#community",
        "ai": "첫 취업 준비 체크리스트를 만들어 줘."
      },
      "areas": [
        {
          "id": "resume",
          "title": "이력·포트폴리오",
          "items": [
            "이력서 초안",
            "포트폴리오 정리",
            "지원 회사 리스트"
          ]
        },
        {
          "id": "apply",
          "title": "지원",
          "items": [
            "채용 공고 확인",
            "지원 일정",
            "서류 제출"
          ]
        },
        {
          "id": "interview",
          "title": "면접",
          "items": [
            "예상 질문",
            "복장·교통",
            "회고 메모"
          ]
        },
        {
          "id": "onboard",
          "title": "입사 준비",
          "items": [
            "서류·준비물",
            "첫 주 목표"
          ]
        }
      ]
    },
    {
      "id": "job-change",
      "title": "이직",
      "blurb": "이직 동기·조건·타임라인을 정리합니다.",
      "stages": [
        "20",
        "30",
        "40",
        "50"
      ],
      "situations": [
        "취업·이직",
        "직장생활"
      ],
      "needs": [
        "커리어",
        "교육",
        "금융",
        "커뮤니티"
      ],
      "checklist": [
        "이직 이유·조건 정리",
        "인수인계 계획",
        "면접·연봉 포인트",
        "퇴사·입사 일정"
      ],
      "resources": [
        {
          "label": "커리어·교육 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "목표·할 일",
          "href": "#ml-goals",
          "status": "guide"
        },
        {
          "label": "경험 나누기",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "community": "#community",
        "ai": "이직 준비 3개월 플랜을 짜 줘."
      }
    },
    {
      "id": "resign",
      "title": "퇴사",
      "blurb": "퇴사 전후 행정·재정·다음 단계를 점검합니다.",
      "stages": [
        "20",
        "30",
        "40",
        "50"
      ],
      "situations": [
        "취업·이직",
        "새로운 도전"
      ],
      "needs": [
        "금융",
        "건강",
        "커리어",
        "생활 정보"
      ],
      "checklist": [
        "퇴사 일정·인수인계",
        "4대보험·연차 정산 확인",
        "비상 자금",
        "다음 3개월 목표"
      ],
      "resources": [
        {
          "label": "생활·금융 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "내 생활 예산",
          "href": "#ml-money",
          "status": "guide"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "ai": "퇴사 전 체크리스트를 만들어 줘."
      }
    },
    {
      "id": "startup",
      "title": "창업",
      "blurb": "아이디어 검증부터 준비 단계까지 가이드합니다. 사업자 등록·결제는 연결하지 않습니다.",
      "stages": [
        "20",
        "30",
        "40",
        "50"
      ],
      "situations": [
        "새로운 도전",
        "직장생활"
      ],
      "needs": [
        "교육",
        "금융",
        "전문가",
        "커뮤니티"
      ],
      "checklist": [
        "문제·고객 가설",
        "최소 검증 계획",
        "비용·법률 안내 확인",
        "멘토·커뮤니티"
      ],
      "resources": [
        {
          "label": "창업 정보 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        },
        {
          "label": "사업자 자동 등록",
          "href": "#explore",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "창업 준비 첫 30일 계획을 세워 줘."
      }
    },
    {
      "id": "independent",
      "title": "독립",
      "blurb": "자취·독립 준비 체크리스트와 생활 서비스를 연결합니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [
        "독립·자취"
      ],
      "needs": [
        "주거",
        "이사",
        "생활비",
        "금융",
        "생활서비스",
        "지원 제도"
      ],
      "checklist": [
        "예산·보증금 계획",
        "방 구하기 체크",
        "생활용품·주소 이전",
        "비상 연락망"
      ],
      "resources": [
        {
          "label": "주거·생활 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "할 일·예산",
          "href": "#life-now",
          "status": "guide"
        },
        {
          "label": "자취 커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "community": "#community",
        "today": "#today",
        "ai": "독립 준비 체크리스트를 만들어 줘."
      },
      "areas": [
        {
          "id": "budget",
          "title": "예산",
          "items": [
            "월 생활비 목표",
            "보증금·중개비 여유",
            "비상금"
          ]
        },
        {
          "id": "home",
          "title": "집 찾기",
          "items": [
            "관심 지역·예산",
            "매물 체크리스트",
            "계약 전 확인 항목"
          ]
        },
        {
          "id": "contract",
          "title": "계약",
          "items": [
            "계약서 확인 포인트",
            "특약 메모",
            "입금·키 인수"
          ]
        },
        {
          "id": "move",
          "title": "이사",
          "items": [
            "일정·견적",
            "짐 리스트",
            "주소 이전"
          ]
        },
        {
          "id": "life",
          "title": "생활 준비",
          "items": [
            "생활용품",
            "인터넷·공과금",
            "비상 연락망"
          ]
        },
        {
          "id": "admin",
          "title": "행정",
          "items": [
            "전입신고 등 공식 안내",
            "보험·카드 주소"
          ]
        },
        {
          "id": "settle",
          "title": "정착",
          "items": [
            "주변 시설 파악",
            "루틴 만들기"
          ]
        }
      ]
    },
    {
      "id": "move",
      "title": "이사",
      "blurb": "이사 일정·견적·입주 준비를 체크리스트로 정리합니다.",
      "stages": [
        "20",
        "30",
        "40",
        "50"
      ],
      "situations": [
        "독립·자취",
        "결혼·동거"
      ],
      "needs": [
        "이사",
        "주거",
        "생활서비스"
      ],
      "checklist": [
        "일정·견적 비교 기준",
        "주소·공과금 이전",
        "짐 리스트",
        "입주 청소"
      ],
      "resources": [
        {
          "label": "생활서비스 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "할 일",
          "href": "#ml-todos",
          "status": "guide"
        },
        {
          "label": "이사 업체 예약",
          "href": "#explore",
          "status": "soon"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "ai": "이사 2주 전 체크리스트를 만들어 줘."
      },
      "areas": [
        {
          "id": "plan",
          "title": "일정",
          "items": [
            "이사일 확정",
            "견적 비교 기준"
          ]
        },
        {
          "id": "pack",
          "title": "짐",
          "items": [
            "짐 리스트",
            "폐기·보관"
          ]
        },
        {
          "id": "admin",
          "title": "행정",
          "items": [
            "주소·공과금",
            "전입 관련 안내"
          ]
        },
        {
          "id": "settle",
          "title": "입주",
          "items": [
            "청소·점검",
            "생활 루틴"
          ]
        }
      ]
    },
    {
      "id": "dating",
      "title": "연애",
      "blurb": "관계·일상 균형을 위한 생활 안내입니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [
        "새로운 도전",
        "직장생활"
      ],
      "needs": [
        "관계",
        "여가",
        "커뮤니티"
      ],
      "checklist": [
        "서로의 기대 정리",
        "함께할 루틴",
        "갈등 시 대화 규칙",
        "개인 시간 확보"
      ],
      "resources": [
        {
          "label": "여가 발견",
          "href": "#today",
          "status": "link"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "today": "#today",
        "community": "#community",
        "ai": "연애와 일상의 균형을 잡는 팁을 알려 줘."
      }
    },
    {
      "id": "marriage",
      "title": "결혼",
      "blurb": "결혼·동거 준비 항목을 생활 관점에서 정리합니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [
        "결혼·동거"
      ],
      "needs": [
        "주거",
        "금융",
        "가족",
        "생활서비스"
      ],
      "checklist": [
        "예산·역할 나누기",
        "주거 계획",
        "서류·일정",
        "일상 루틴"
      ],
      "resources": [
        {
          "label": "주거·금융 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "목표 관리",
          "href": "#ml-goals",
          "status": "guide"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "community": "#community",
        "ai": "결혼 준비 체크리스트를 만들어 줘."
      }
    },
    {
      "id": "pregnancy",
      "title": "임신",
      "blurb": "임신 중 생활 준비 정보를 모읍니다. 의료 조언은 제공하지 않습니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [
        "임신·육아"
      ],
      "needs": [
        "건강",
        "가족",
        "지원 제도",
        "커뮤니티"
      ],
      "checklist": [
        "공식 검진 일정 확인",
        "생활·영양 루틴",
        "지원 제도 안내",
        "비상 연락망"
      ],
      "resources": [
        {
          "label": "가족·복지 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        },
        {
          "label": "의료 상담·예약",
          "href": "#explore",
          "status": "soon"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "임신 중 생활 준비 체크리스트를 만들어 줘. 의료 조언은 제외해."
      }
    },
    {
      "id": "childbirth",
      "title": "출산",
      "blurb": "출산 전후 생활 준비 항목을 정리합니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [
        "임신·육아"
      ],
      "needs": [
        "가족",
        "건강",
        "생활서비스",
        "커뮤니티"
      ],
      "checklist": [
        "입원·귀가 가방",
        "출생 신고·서류",
        "산후 지원 네트워크",
        "수면·식사 루틴"
      ],
      "resources": [
        {
          "label": "보육·복지 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "할 일",
          "href": "#life-now",
          "status": "guide"
        },
        {
          "label": "가족 커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "community": "#community"
      }
    },
    {
      "id": "parenting",
      "title": "육아",
      "blurb": "일상 육아 정보와 커뮤니티·서비스를 연결합니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [
        "임신·육아"
      ],
      "needs": [
        "보육",
        "교육",
        "건강",
        "커뮤니티",
        "생활서비스"
      ],
      "checklist": [
        "주간 루틴",
        "보육·돌봄 옵션 조사",
        "검진 기록(본인)",
        "부모 휴식"
      ],
      "resources": [
        {
          "label": "보육 정보",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "육아 커뮤니티",
          "href": "#community",
          "status": "link"
        },
        {
          "label": "돌봄 매칭",
          "href": "#explore",
          "status": "soon"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "today": "#today",
        "ai": "육아 주간 루틴을 짜 줘."
      }
    },
    {
      "id": "child-edu",
      "title": "자녀 교육",
      "blurb": "학습·진로 탐색을 부모 관점에서 정리합니다.",
      "stages": [
        "30",
        "40",
        "50"
      ],
      "situations": [
        "임신·육아",
        "직장생활"
      ],
      "needs": [
        "교육",
        "진로",
        "커뮤니티"
      ],
      "checklist": [
        "아이 관심·강점 메모",
        "학교·학원 비교 기준",
        "가정 학습 루틴",
        "상담·커뮤니티"
      ],
      "resources": [
        {
          "label": "교육 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "가족 커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "자녀 교육 준비 포인트를 정리해 줘."
      }
    },
    {
      "id": "home-buy",
      "title": "내 집 마련",
      "blurb": "주거·금융 정보 탐색을 돕습니다. 대출 심사는 제공하지 않습니다.",
      "stages": [
        "30",
        "40",
        "50"
      ],
      "situations": [
        "독립·자취",
        "결혼·동거",
        "직장생활"
      ],
      "needs": [
        "주거",
        "금융",
        "지원 제도"
      ],
      "checklist": [
        "예산·대출 한도(본인 확인)",
        "관심 지역·평형",
        "공시·규제 공식 안내",
        "상환 계획"
      ],
      "resources": [
        {
          "label": "주거·금융 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "저축 목표",
          "href": "#ml-money",
          "status": "guide"
        },
        {
          "label": "대출 자동 심사",
          "href": "#explore",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "lifeNow": "#life-now",
        "ai": "내 집 마련 준비 단계를 알려 줘."
      }
    },
    {
      "id": "family-care",
      "title": "가족 돌봄",
      "blurb": "가족 돌봄 정보와 Ongil 연결 안내를 제공합니다.",
      "stages": [
        "30",
        "40",
        "50",
        "60"
      ],
      "situations": [
        "가족 돌봄"
      ],
      "needs": [
        "돌봄",
        "건강",
        "복지",
        "커뮤니티"
      ],
      "checklist": [
        "역할·일정 분담",
        "복지 공식 안내",
        "비상 연락망",
        "돌봄자 휴식"
      ],
      "resources": [
        {
          "label": "복지·돌봄 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "Ongil 돌봄",
          "href": "/ongil-start/#care",
          "status": "link"
        },
        {
          "label": "가족 캘린더",
          "href": "#life-now",
          "status": "soon"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "가족 돌봄 역할을 나누는 방법을 정리해 줘."
      }
    },
    {
      "id": "parent-care",
      "title": "부모 돌봄",
      "blurb": "시니어 생활·돌봄 연결을 안내합니다.",
      "stages": [
        "40",
        "50",
        "60"
      ],
      "situations": [
        "가족 돌봄"
      ],
      "needs": [
        "시니어",
        "건강",
        "돌봄",
        "복지"
      ],
      "checklist": [
        "부모 생활 현황",
        "돌봄 옵션",
        "행정·복지 안내",
        "형제·자매 역할"
      ],
      "resources": [
        {
          "label": "Ongil 시니어",
          "href": "/ongil-start/#care",
          "status": "link"
        },
        {
          "label": "시니어 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "community": "#community",
        "ai": "부모 돌봄 준비 체크리스트를 만들어 줘."
      }
    },
    {
      "id": "retire-prep",
      "title": "은퇴",
      "blurb": "은퇴 전 재정·시간·관계 계획을 돕습니다.",
      "stages": [
        "50",
        "60"
      ],
      "situations": [
        "은퇴 준비"
      ],
      "needs": [
        "금융",
        "건강",
        "여가",
        "배움"
      ],
      "checklist": [
        "수입·지출 재구성",
        "연금·보험 안내 확인",
        "하루·주간 루틴",
        "배움·취미 후보"
      ],
      "resources": [
        {
          "label": "시니어·금융 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "은퇴 패키지",
          "href": "#life",
          "status": "guide"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "life": "#life",
        "community": "#community",
        "ai": "은퇴 1년 전 준비 목록을 만들어 줘."
      }
    },
    {
      "id": "later-life",
      "title": "노후 준비",
      "blurb": "건강·관계·지역 활동 중심으로 노후 생활을 설계합니다.",
      "stages": [
        "60",
        "70"
      ],
      "situations": [
        "은퇴 후 생활",
        "은퇴 준비"
      ],
      "needs": [
        "건강",
        "지역 활동",
        "취미",
        "가족"
      ],
      "checklist": [
        "건강 루틴",
        "지역 시설·모임",
        "가족·친구 연결",
        "디지털·생활 편의"
      ],
      "resources": [
        {
          "label": "시니어 생활 탐색",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "오늘의 발견",
          "href": "#today",
          "status": "link"
        },
        {
          "label": "커뮤니티",
          "href": "#community",
          "status": "link"
        }
      ],
      "links": {
        "explore": "#explore",
        "today": "#today",
        "community": "#community",
        "ai": "노후 일상 루틴을 제안해 줘."
      }
    },
    {
      "id": "campus-life",
      "title": "대학생활",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20"
      ],
      "situations": [],
      "needs": [
        "교육"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "대학생활 준비 포인트를 알려 줘."
      },
      "category": "교육",
      "planned": true
    },
    {
      "id": "cert",
      "title": "자격증",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "교육"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "자격증 준비 포인트를 알려 줘."
      },
      "category": "교육",
      "planned": true
    },
    {
      "id": "freelance",
      "title": "프리랜서",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "커리어"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "프리랜서 준비 포인트를 알려 줘."
      },
      "category": "커리어",
      "planned": true
    },
    {
      "id": "car",
      "title": "차량 구매",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "생활"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "차량 구매 준비 포인트를 알려 줘."
      },
      "category": "생활",
      "planned": true
    },
    {
      "id": "abroad",
      "title": "해외생활",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "생활"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "해외생활 준비 포인트를 알려 줘."
      },
      "category": "생활",
      "planned": true
    },
    {
      "id": "newlywed",
      "title": "신혼생활",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [],
      "needs": [
        "관계·가족"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "신혼생활 준비 포인트를 알려 줘."
      },
      "category": "관계·가족",
      "planned": true
    },
    {
      "id": "first-salary",
      "title": "첫 월급",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [],
      "needs": [
        "재정"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "첫 월급 준비 포인트를 알려 줘."
      },
      "category": "재정",
      "planned": true
    },
    {
      "id": "saving",
      "title": "저축 시작",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "재정"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "저축 시작 준비 포인트를 알려 줘."
      },
      "category": "재정",
      "planned": true
    },
    {
      "id": "loan",
      "title": "대출 준비",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "30",
        "40",
        "50"
      ],
      "situations": [],
      "needs": [
        "재정"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "대출 준비 준비 포인트를 알려 줘."
      },
      "category": "재정",
      "planned": true
    },
    {
      "id": "checkup",
      "title": "건강검진",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "30",
        "40",
        "50",
        "60"
      ],
      "situations": [],
      "needs": [
        "건강"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "건강검진 준비 포인트를 알려 줘."
      },
      "category": "건강",
      "planned": true
    },
    {
      "id": "habit-health",
      "title": "생활습관 개선",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40",
        "50"
      ],
      "situations": [],
      "needs": [
        "건강"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "생활습관 개선 준비 포인트를 알려 줘."
      },
      "category": "건강",
      "planned": true
    },
    {
      "id": "parent-health",
      "title": "부모 건강관리",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "40",
        "50",
        "60"
      ],
      "situations": [],
      "needs": [
        "가족 돌봄"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "부모 건강관리 준비 포인트를 알려 줘."
      },
      "category": "가족 돌봄",
      "planned": true
    },
    {
      "id": "first-trip",
      "title": "첫 해외여행",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30"
      ],
      "situations": [],
      "needs": [
        "여행·경험"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "첫 해외여행 준비 포인트를 알려 줘."
      },
      "category": "여행·경험",
      "planned": true
    },
    {
      "id": "long-trip",
      "title": "장기여행",
      "blurb": "확장 예정 Life Event입니다. 구조는 준비되어 있으며 상세 가이드는 단계적으로 채워집니다.",
      "stages": [
        "20",
        "30",
        "40"
      ],
      "situations": [],
      "needs": [
        "여행·경험"
      ],
      "checklist": [
        "관심 메모",
        "관련 정보 탐색",
        "내 생활에 목표 등록"
      ],
      "resources": [
        {
          "label": "탐색에서 관련 안내",
          "href": "#explore",
          "status": "link"
        },
        {
          "label": "상세 가이드",
          "href": "#life-events",
          "status": "planned"
        }
      ],
      "links": {
        "explore": "#explore",
        "ai": "장기여행 준비 포인트를 알려 줘."
      },
      "category": "여행·경험",
      "planned": true
    }
  ],
  "stageGuides": {
    "10": {
      "checklist": [
        "관심 과목·활동 3가지 적기",
        "이번 주 학습·휴식 균형",
        "진로 체험 1회 찾아보기",
        "안전한 온라인 습관 점검"
      ],
      "benefits": [
        {
          "label": "청소년 상담·진로 공식 안내",
          "status": "info"
        },
        {
          "label": "지역 청소년 프로그램 안내",
          "status": "link",
          "href": "#explore"
        },
        {
          "label": "장학금 자동 매칭",
          "status": "planned"
        }
      ],
      "contents": [
        {
          "label": "오늘의 발견 · 배움",
          "href": "#td-learn"
        },
        {
          "label": "취미·체험",
          "href": "#td-hobby"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "20": {
      "checklist": [
        "이력·포트폴리오 초안",
        "월 생활비·저축 목표",
        "주거·독립 체크",
        "한 달 루틴 정리"
      ],
      "benefits": [
        {
          "label": "고용·직업훈련 공식 안내",
          "status": "link",
          "href": "#explore"
        },
        {
          "label": "청년 주거·금융 포털 안내",
          "status": "info"
        },
        {
          "label": "실시간 채용 매칭",
          "status": "soon"
        }
      ],
      "contents": [
        {
          "label": "자취·독립 발견",
          "href": "#today"
        },
        {
          "label": "커리어·교육 탐색",
          "href": "#explore"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "30": {
      "checklist": [
        "일과 휴식 균형 점검",
        "주거·금융 중기 목표",
        "가족·관계 일정",
        "건강·운동 루틴"
      ],
      "benefits": [
        {
          "label": "보육·복지 공식 안내",
          "status": "link",
          "href": "#explore"
        },
        {
          "label": "주택·금융 정보 포털",
          "status": "info"
        },
        {
          "label": "자동 세금 환급",
          "status": "planned"
        }
      ],
      "contents": [
        {
          "label": "가족·일상 발견",
          "href": "#td-everyday"
        },
        {
          "label": "함께하는 활동",
          "href": "#td-together"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "40": {
      "checklist": [
        "가족·자녀 일정 정리",
        "건강 체크 주기",
        "커리어·재정 중간 점검",
        "나만을 위한 여가 1개"
      ],
      "benefits": [
        {
          "label": "가족·교육 지원 안내",
          "status": "info"
        },
        {
          "label": "건강검진·생활 정보",
          "status": "link",
          "href": "#explore"
        },
        {
          "label": "자산 자동 리밸런싱",
          "status": "planned"
        }
      ],
      "contents": [
        {
          "label": "건강·일상",
          "href": "#td-everyday"
        },
        {
          "label": "여가·여행",
          "href": "#td-places"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "50": {
      "checklist": [
        "인생 2막 관심 키워드",
        "건강·수면 루틴",
        "재정·은퇴 시나리오",
        "배움·취미 후보 3개"
      ],
      "benefits": [
        {
          "label": "중장년 재취업·교육 안내",
          "status": "link",
          "href": "#explore"
        },
        {
          "label": "연금·금융 공식 안내",
          "status": "info"
        },
        {
          "label": "은퇴 시뮬레이터",
          "status": "soon"
        }
      ],
      "contents": [
        {
          "label": "배움·클래스",
          "href": "#td-learn"
        },
        {
          "label": "탐색",
          "href": "#explore"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "60": {
      "checklist": [
        "주간 건강·산책 루틴",
        "지역 모임·시설 1곳",
        "가족·친구 연락 주기",
        "배움·여가 일정"
      ],
      "benefits": [
        {
          "label": "시니어 복지·할인 안내",
          "status": "info"
        },
        {
          "label": "Ongil 돌봄·생활",
          "status": "link",
          "href": "/ongil-start/#care"
        },
        {
          "label": "돌봄 예약·결제",
          "status": "soon"
        }
      ],
      "contents": [
        {
          "label": "시니어 여가 발견",
          "href": "#today"
        },
        {
          "label": "지역·건강 탐색",
          "href": "#explore"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    },
    "70": {
      "checklist": [
        "하루 리듬·식사(본인)",
        "가까운 시설 메모",
        "가족과 공유할 일정",
        "좋아하는 활동 유지"
      ],
      "benefits": [
        {
          "label": "시니어·복지 공식 안내",
          "status": "info"
        },
        {
          "label": "Ongil 연결",
          "status": "link",
          "href": "/ongil-start/#care"
        },
        {
          "label": "원격 의료 처방",
          "status": "planned"
        }
      ],
      "contents": [
        {
          "label": "일상·문화",
          "href": "#td-everyday"
        },
        {
          "label": "지역 생활",
          "href": "#explore"
        },
        {
          "label": "커뮤니티",
          "href": "#community"
        }
      ]
    }
  },
  "eventCategories": [
    "교육",
    "커리어",
    "생활",
    "관계·가족",
    "재정",
    "건강",
    "가족 돌봄",
    "여행·경험"
  ]
};
