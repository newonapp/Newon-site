/**
 * New Business service details — same renderer fields as existing pages.
 * KO/EN only; other langs fall back to EN.
 */
function S(ko, en) {
  return { ko, en };
}

function faq(pairs) {
  return pairs.map(([q, a]) => ({ q, a }));
}

function items(rows) {
  return rows.map((r, i) => ({
    n: String(i + 1).padStart(2, "0"),
    title: r[0],
    body: r[1],
  }));
}

const COMMON_KO = {
  crumbBusiness: "BUSINESS",
  crumbServices: "SERVICES",
  relatedTitle: "관련 서비스",
  exploreAll: "모든 서비스 보기 →",
  prevLabel: "이전 서비스",
  nextLabel: "다음 서비스",
};

const COMMON_EN = {
  crumbBusiness: "BUSINESS",
  crumbServices: "SERVICES",
  relatedTitle: "Related services",
  exploreAll: "Explore all services →",
  prevLabel: "Previous service",
  nextLabel: "Next service",
};

export const NEW_BUSINESS_SERVICES = {
  "website-renewal": {
    ko: {
      ...COMMON_KO,
      seoTitle: "Website Renewal | Newon Business",
      metaDescription:
        "기존 웹사이트를 처음부터 새로 만들지 않고, 구조·사용성·모바일·기능을 검토해 개선합니다. 범위와 비용은 현황 확인 후 견적합니다.",
      navLabel: "RENEWAL",
      eyebrow: "WEBSITE RENEWAL",
      subEyebrow: "BUILD",
      headline: "처음부터 다시 만들지 않고,\n필요한 곳을 고칩니다.",
      lead: "기존 웹사이트의 구조와 운영 상황을 검토해 디자인, 사용성, 모바일 대응, 필요한 기능을 개선합니다. 부분 개선과 전체 리뉴얼 중 범위를 정해 진행합니다.",
      ctaPrimary: "리뉴얼 문의하기 →",
      ctaSecondary: "작업 범위 보기 ↓",
      solveTitle: "이런 팀에 필요합니다",
      solveItems: items([
        ["사이트가 있으나 오래되었다", "정보는 있지만 모바일·문의·이동 경로가 불편한 경우."],
        ["전면 재제작은 부담이다", "브랜드와 구조를 유지하면서 문제만 고치고 싶은 경우."],
        ["기능은 일부만 바꾸면 된다", "문의 흐름, 메뉴, 성능처럼 특정 구간만 손보고 싶은 경우."],
      ]),
      getTitle: "무엇을 검토하고 만드나요",
      getItems: items([
        ["현황 검토", "구조, 문제점, 모바일, 콘텐츠, 문의 흐름을 확인합니다."],
        ["개선 범위 제안", "부분 개선과 전체 리뉴얼 중 어디가 맞는지 함께 정합니다."],
        ["합의한 화면·기능 개선", "메뉴, 콘텐츠, 문의, 성능, 접근성, 기본 SEO를 범위 안에서 손봅니다."],
        ["필요 시 기능 추가", "기존 기능 수정과 신규 기능은 검토 후 견적에 반영합니다."],
      ]),
      processTitle: "진행 과정",
      processItems: items([
        ["DISCOVER", "현재 사이트와 운영 목표를 확인합니다."],
        ["SCOPE", "부분 개선 또는 전체 리뉴얼 범위를 정합니다."],
        ["DESIGN / BUILD", "합의한 화면과 기능을 수정합니다."],
        ["QA / LAUNCH", "검수 후 배포하고 변경 내용을 전달합니다."],
      ]),
      deliverTitle: "결과물",
      deliverItems: ["개선된 페이지 또는 사이트", "변경 범위 요약", "운영에 필요한 짧은 안내"],
      whoTitle: "선택할 수 있는 유형",
      whoItems: [
        "A. 부분 개선 — 기존 디자인과 구조를 최대한 유지하고 필요한 부분만 수정",
        "B. 전체 리뉴얼 — 목적과 문제점을 검토한 뒤 범위를 정해 전반적으로 개선",
      ],
      faqs: faq([
        ["기간과 비용은 얼마인가요?", "기존 사이트의 상태와 요구사항을 확인한 뒤 산정합니다. 확정되지 않은 금액은 표시하지 않습니다."],
        ["모든 사이트를 고칠 수 있나요?", "소스·호스팅·권한에 따라 다릅니다. 사전 검토 후 가능 여부를 안내합니다."],
        ["디자인을 완전히 바꿔야 하나요?", "아닙니다. 부분 개선은 기존 디자인을 유지하는 방향입니다."],
      ]),
      ctaFinalTitle: "기존 사이트를\n어떻게 고칠지 이야기해주세요.",
      ctaFinalLead: "URL과 불편한 점을 알려주시면 범위를 함께 정합니다.",
      ctaFinalBtn: "리뉴얼 문의하기 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Website Renewal | Newon Business",
      metaDescription:
        "Improve an existing website’s structure, usability, mobile experience, and features without starting from zero. Scope and cost follow a review.",
      navLabel: "RENEWAL",
      eyebrow: "WEBSITE RENEWAL",
      subEyebrow: "BUILD",
      headline: "Fix what needs fixing\nwithout rebuilding everything.",
      lead: "We review how the current site is structured and run, then improve design, usability, mobile, and needed features. You choose a partial improvement or a broader renewal.",
      ctaPrimary: "Inquire about renewal →",
      ctaSecondary: "See scope ↓",
      solveTitle: "Who this is for",
      solveItems: items([
        ["The site exists but feels dated", "Information is there; mobile, inquiry, or navigation is hard."],
        ["A full rebuild is too much", "You want to keep brand and structure and fix problems."],
        ["Only some features need work", "Menus, inquiry flow, or performance — not the whole product."],
      ]),
      getTitle: "What we review and deliver",
      getItems: items([
        ["Current-state review", "Structure, issues, mobile, content, and inquiry flow."],
        ["Scope proposal", "Partial improvement vs broader renewal."],
        ["Agreed screen and feature work", "Menus, content, inquiry, performance, accessibility, basic SEO."],
        ["New features if needed", "Edits and additions are quoted after review."],
      ]),
      processTitle: "Process",
      processItems: items([
        ["DISCOVER", "Review the live site and goals."],
        ["SCOPE", "Choose partial improvement or broader renewal."],
        ["DESIGN / BUILD", "Change the agreed screens and features."],
        ["QA / LAUNCH", "QA, deploy, and hand off what changed."],
      ]),
      deliverTitle: "Deliverables",
      deliverItems: ["Updated pages or site", "Scope summary", "Short operating notes"],
      whoTitle: "Two types",
      whoItems: [
        "A. Partial improvement — keep design and structure; change only what is needed",
        "B. Full renewal — review purpose and issues, then improve within an agreed range",
      ],
      faqs: faq([
        ["What does it cost and how long?", "After we see the current site and needs. We do not invent prices."],
        ["Can you change any site?", "It depends on source, hosting, and access. We confirm after a review."],
        ["Do we have to change the whole design?", "No. Partial work keeps the current design."],
      ]),
      ctaFinalTitle: "Tell us what to fix\non the current site.",
      ctaFinalLead: "Share the URL and what is hard to use. We will set a range together.",
      ctaFinalBtn: "Inquire about renewal →",
    },
  },

  improvement: {
    ko: {
      ...COMMON_KO,
      seoTitle: "Web & App Improvement | Newon Business",
      metaDescription:
        "이미 보유한 웹·앱에 기능을 더하고 오류를 검토합니다. 모든 프로젝트를 수정할 수 있다고 보장하지 않으며, 기술 검토 후 범위를 안내합니다.",
      navLabel: "IMPROVE",
      eyebrow: "WEB & APP IMPROVEMENT",
      subEyebrow: "BUILD",
      headline: "이미 있는 웹·앱에\n기능을 더하고 고칩니다.",
      lead: "고객이 이미 보유한 웹사이트나 앱을 대상으로 기능 추가, 화면 흐름 개선, 오류 분석·수정, 연동과 배포 문제를 검토합니다. 착수 전 소스와 환경을 확인합니다.",
      ctaPrimary: "개선 문의하기 →",
      ctaSecondary: "확인 항목 보기 ↓",
      solveTitle: "이런 작업을 다룹니다",
      solveItems: items([
        ["기능 추가", "기존 웹·앱에 필요한 화면과 기능을 더합니다."],
        ["오류와 운영 문제", "재현 가능한 오류와 배포 이슈의 원인을 살펴 수정합니다."],
        ["흐름·권한·연동", "로그인, 관리자, 외부 서비스 연동을 범위 안에서 개선합니다."],
      ]),
      getTitle: "착수 전 확인 항목",
      getItems: items([
        ["소스코드 접근", "저장소와 권한을 확인할 수 있는지."],
        ["서버 및 배포 환경", "호스팅, 스토어, CI/CD 상태."],
        ["기술 스택", "사용 중인 프레임워크와 버전."],
        ["외부 계정", "결제·알림·로그인 등 연동 권한."],
        ["오류 재현", "문제를 재현할 수 있는 절차."],
        ["유지보수 상태", "방치된 의존성·문서 여부."],
      ]),
      processTitle: "진행 과정",
      processItems: items([
        ["REVIEW", "코드·환경·이슈를 검토합니다."],
        ["FEASIBILITY", "작업 가능 여부와 범위를 안내합니다."],
        ["FIX / BUILD", "합의한 수정과 기능을 진행합니다."],
        ["VERIFY", "검수 후 배포를 지원합니다."],
      ]),
      deliverTitle: "결과물",
      deliverItems: ["합의된 수정 또는 기능", "변경 요약", "재현·배포 메모"],
      whoTitle: "기본 범위와 추가 견적",
      whoItems: [
        "기본: 합의한 기능 추가, 화면 흐름, 오류 수정, 관리자·연동 중 범위에 포함된 항목",
        "추가 견적: 대규모 재작성, 스택 교체, 데이터 이전, 신규 외부 연동",
        "모든 기존 프로젝트를 무조건 수정할 수 있다고 보장하지 않습니다.",
      ],
      faqs: faq([
        ["Newon이 만들지 않은 제품도 되나요?", "사전 기술 검토 후 가능 여부를 안내합니다."],
        ["소스 없이 진행할 수 있나요?", "제한적입니다. 접근이 없으면 작업 범위가 크게 줄어들 수 있습니다."],
      ]),
      ctaFinalTitle: "보유 중인 웹·앱의\n상태를 알려주세요.",
      ctaFinalLead: "스택과 이슈를 공유해 주시면 검토 후 가능 범위를 안내합니다.",
      ctaFinalBtn: "개선 문의하기 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Web & App Improvement | Newon Business",
      metaDescription:
        "Add features and review defects on a website or app you already run. We do not guarantee every stack can be changed; a technical review comes first.",
      navLabel: "IMPROVE",
      eyebrow: "WEB & APP IMPROVEMENT",
      subEyebrow: "BUILD",
      headline: "Add and fix work\non a product you already have.",
      lead: "For websites and apps you already run: features, flows, defect analysis, integrations, and deploy issues. We review source and environment first.",
      ctaPrimary: "Inquire about improvement →",
      ctaSecondary: "See checklist ↓",
      solveTitle: "What this covers",
      solveItems: items([
        ["New features", "Add screens and capabilities to the existing product."],
        ["Defects and ops issues", "Analyze reproducible bugs and deploy problems."],
        ["Flow, access, integrations", "Login, admin, and third-party links within scope."],
      ]),
      getTitle: "What we check before kickoff",
      getItems: items([
        ["Source access", "Whether the repository and permissions are available."],
        ["Hosting and deploy", "Servers, stores, CI/CD."],
        ["Stack", "Frameworks and versions in use."],
        ["Third-party accounts", "Payments, messaging, login."],
        ["Reproduction", "Steps to see the issue."],
        ["Maintenance state", "Stale dependencies and missing docs."],
      ]),
      processTitle: "Process",
      processItems: items([
        ["REVIEW", "Inspect code, environment, and issues."],
        ["FEASIBILITY", "Say what can be done and what cannot."],
        ["FIX / BUILD", "Do the agreed fixes and features."],
        ["VERIFY", "QA and support deploy."],
      ]),
      deliverTitle: "Deliverables",
      deliverItems: ["Agreed fixes or features", "Change summary", "Reproduce/deploy notes"],
      whoTitle: "In scope vs extra quote",
      whoItems: [
        "Included: agreed features, flows, defects, admin or integrations listed in the quote",
        "Extra quote: large rewrites, stack changes, data migration, new third-party links",
        "We do not guarantee every existing project can be modified.",
      ],
      faqs: faq([
        ["Products not built by Newon?", "Yes, after a technical review of feasibility."],
        ["No source access?", "Work is limited. Range can shrink a lot without access."],
      ]),
      ctaFinalTitle: "Tell us about the\nproduct you already run.",
      ctaFinalLead: "Share stack and issues. We reply with a feasible range.",
      ctaFinalBtn: "Inquire about improvement →",
    },
  },

  booking: {
    ko: {
      ...COMMON_KO,
      seoTitle: "Booking & Customer Management | Newon Business",
      metaDescription:
        "예약·문의·고객 이력을 관리하는 시스템을 구축합니다. 기본 기능과 결제·알림 등 추가 개발을 구분하며, 외부 서비스 요금은 별도일 수 있습니다.",
      navLabel: "BOOKING",
      eyebrow: "BOOKING & CUSTOMER MANAGEMENT",
      subEyebrow: "AUTOMATION",
      headline: "예약과 문의를\n한 흐름으로 받습니다.",
      lead: "미용·교육·스튜디오·전문 서비스처럼 예약과 문의가 많은 사업장, 또는 자체 관리가 필요한 기업을 위해 신청·일정·문의·이력을 구축합니다. 모든 업무를 자동 처리한다고 보지 않습니다.",
      ctaPrimary: "예약 시스템 문의 →",
      ctaSecondary: "기능 범위 보기 ↓",
      solveTitle: "대상 고객",
      solveItems: items([
        ["예약이 많은 소규모 사업장", "미용, 학원, 촬영, 전문 서비스."],
        ["문의가 흩어져 있는 팀", "전화·메신저·폼이 섞여 이력이 남지 않는 경우."],
        ["웹사이트와 연결이 필요한 경우", "기존 소개 사이트에 신청·관리를 붙이고 싶은 경우."],
      ]),
      getTitle: "기본 제공을 검토하는 기능",
      getItems: items([
        ["온라인 예약 신청", "일정 관리와 상태 변경."],
        ["고객 문의 접수", "유형 분류와 상담 이력."],
        ["관리자 화면", "직원 배정, 기본 운영 통계."],
        ["알림(범위 내)", "계약한 채널만. 외부 요금은 별도일 수 있습니다."],
        ["기존 웹과 연결", "소개 사이트에서 신청으로 이어지는 경로."],
      ]),
      processTitle: "진행 과정",
      processItems: items([
        ["DISCOVER", "예약·문의 절차와 개인정보 요구를 확인합니다."],
        ["DESIGN", "권한, 상태, 화면을 정합니다."],
        ["BUILD", "기본 기능과 합의한 연동을 구현합니다."],
        ["LAUNCH", "검수·배포 후 운영 안내를 전달합니다."],
      ]),
      deliverTitle: "결과물",
      deliverItems: ["예약·문의 관리 화면", "권한 안내", "운영 메모"],
      whoTitle: "추가 개발·별도 비용",
      whoItems: [
        "추가 개발: 온라인 결제, 문자·이메일, 이용 이력, 회원 권한, 외부 캘린더, 지점, 맞춤 보고서",
        "결제·문자·이메일·캘린더는 각 제공업체 요금과 연동 가능 여부에 따라 별도 비용이 발생할 수 있습니다.",
        "개인정보를 다루므로 접근 권한과 데이터 보호 요구사항을 사전 검토합니다.",
      ],
      faqs: faq([
        ["모든 예약을 자동으로 확정하나요?", "아닙니다. 상태 변경과 담당자 확인을 전제로 설계합니다."],
        ["가격은 얼마인가요?", "기능과 연동 범위를 본 뒤 별도 견적입니다."],
      ]),
      ctaFinalTitle: "예약·문의가 어떻게\n들어오는지 알려주세요.",
      ctaFinalLead: "업종과 필요한 기능을 공유해 주시면 구축 범위를 검토합니다.",
      ctaFinalBtn: "예약 시스템 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Booking & Customer Management | Newon Business",
      metaDescription:
        "Build booking, inquiry, and customer-history tools. Base features are separate from payments and messaging add-ons. Third-party fees may apply.",
      navLabel: "BOOKING",
      eyebrow: "BOOKING & CUSTOMER MANAGEMENT",
      subEyebrow: "AUTOMATION",
      headline: "Take bookings and inquiries\nin one flow.",
      lead: "For beauty, education, studios, professional services, and teams that need their own booking and inquiry tools. We do not claim to automate every job.",
      ctaPrimary: "Inquire about booking →",
      ctaSecondary: "See features ↓",
      solveTitle: "Who this is for",
      solveItems: items([
        ["Small businesses with many bookings", "Salons, academies, studios, professional services."],
        ["Scattered inquiries", "Phone, chat, and forms with no history."],
        ["Need a link from the website", "Add request and admin flows to an existing site."],
      ]),
      getTitle: "Base capabilities we can scope",
      getItems: items([
        ["Online booking requests", "Schedule and status changes."],
        ["Inquiry intake", "Types and conversation history."],
        ["Admin", "Staff assignment and basic ops stats."],
        ["Notifications in scope", "Only contracted channels. Vendor fees may be extra."],
        ["Link from the current site", "From the brochure site to a request."],
      ]),
      processTitle: "Process",
      processItems: items([
        ["DISCOVER", "Map booking/inquiry steps and privacy needs."],
        ["DESIGN", "Set permissions, statuses, and screens."],
        ["BUILD", "Implement base features and agreed integrations."],
        ["LAUNCH", "QA, deploy, and hand off operating notes."],
      ]),
      deliverTitle: "Deliverables",
      deliverItems: ["Booking and inquiry admin", "Access notes", "Operating memo"],
      whoTitle: "Add-ons and extra cost",
      whoItems: [
        "Add-ons: online payments, SMS/email, visit history, membership, calendars, branches, custom reports",
        "Payments, SMS, email, and calendars may add vendor fees and depend on technical access.",
        "Because personal data is involved, access and protection needs are reviewed first.",
      ],
      faqs: faq([
        ["Are bookings auto-confirmed?", "No. Status changes assume an owner check."],
        ["Price?", "Custom quote after features and integrations."],
      ]),
      ctaFinalTitle: "How do bookings\nand inquiries arrive today?",
      ctaFinalLead: "Share industry and needed features. We review build range.",
      ctaFinalBtn: "Inquire about booking →",
    },
  },

  maintenance: {
    ko: {
      ...COMMON_KO,
      seoTitle: "Monthly Maintenance | Newon Business",
      metaDescription:
        "출시 이후 오류, 운영 이슈, 소규모 변경을 계약 범위에 따라 지원합니다. 신규 개발이 무제한 포함되지 않으며, 금액은 별도 견적입니다.",
      navLabel: "CARE",
      eyebrow: "MONTHLY MAINTENANCE",
      subEyebrow: "CARE",
      headline: "만든 다음에도\n필요한 범위에서 관리합니다.",
      lead: "웹사이트와 앱을 출시한 뒤 발생하는 오류, 운영 이슈, 필요한 변경을 계약 범위에 따라 지원합니다. Newon 제작 고객뿐 아니라 외부 제작분도 기술 검토 후 의뢰할 수 있습니다. 모든 스택을 보장하지 않습니다.",
      ctaPrimary: "유지보수 문의 →",
      ctaSecondary: "포함 범위 보기 ↓",
      solveTitle: "계약 범위에서 다루는 일",
      solveItems: items([
        ["오류 확인과 수정", "운영 중 발생하는 이슈를 범위 안에서 확인·수정합니다."],
        ["정기 점검", "기능·환경의 기본 점검을 합의한 주기로 진행합니다."],
        ["작은 변경", "텍스트, 이미지, 경미한 화면 수정."],
        ["배포 지원", "합의한 업데이트와 배포."],
      ]),
      getTitle: "포함되지 않는 작업 (별도)",
      getItems: items([
        ["신규 기능 개발", "월간 유지보수에 무제한 개발이 포함되지 않습니다."],
        ["대규모 디자인 개편", "별도 프로젝트로 견적합니다."],
        ["데이터 이전·서버 구조 변경", "대규모 인프라 작업은 범위 밖입니다."],
        ["신규 외부 연동·대규모 성능 개선", "추가 계약이 필요합니다."],
      ]),
      processTitle: "구성 예시 (가격 미확정)",
      processItems: items([
        ["BASIC", "기본 점검과 소규모 수정 — 예시 상품명입니다."],
        ["STANDARD", "정기 유지보수와 운영 지원 — 예시 상품명입니다."],
        ["CUSTOM", "기업별 요구에 맞춘 계약 — 예시 상품명입니다."],
      ]),
      deliverTitle: "운영 방식",
      deliverItems: ["요청 접수", "작업 내역 관리", "합의한 배포"],
      whoTitle: "견적 안내",
      whoItems: [
        "실제 가격, 월 작업 시간, 응답 보장 시간은 확정되지 않아 표시하지 않습니다.",
        "계약 범위, 작업량, 시스템 상태, 운영 환경에 따라 별도 견적합니다.",
        "긴급 장애 대응, 24시간 모니터링, 보안 관제는 제공하지 않는 한 상품에 넣지 않습니다.",
      ],
      faqs: faq([
        ["모든 신규 개발이 포함되나요?", "아닙니다. 신규 기능은 별도 견적입니다."],
        ["외부 업체가 만든 제품도 되나요?", "기술 검토 후 가능 여부를 안내합니다."],
      ]),
      ctaFinalTitle: "운영 중인 웹·앱의\n유지보수를 상의하세요.",
      ctaFinalLead: "스택과 필요한 지원 범위를 알려주시면 검토합니다.",
      ctaFinalBtn: "유지보수 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Monthly Maintenance | Newon Business",
      metaDescription:
        "Support defects, ops issues, and small changes after launch, within the contract. New development is not unlimited. Price is a custom quote.",
      navLabel: "CARE",
      eyebrow: "MONTHLY MAINTENANCE",
      subEyebrow: "CARE",
      headline: "Keep running the product\nwithin an agreed range.",
      lead: "After launch: defects, ops issues, and needed changes, by contract. Newon-built and third-party products can be reviewed. We do not support every stack.",
      ctaPrimary: "Inquire about maintenance →",
      ctaSecondary: "See what is included ↓",
      solveTitle: "What a contract can cover",
      solveItems: items([
        ["Defects", "Review and fix in-scope production issues."],
        ["Regular checks", "Basic feature and environment checks on an agreed cadence."],
        ["Small edits", "Copy, images, minor layout."],
        ["Deploy support", "Agreed updates and releases."],
      ]),
      getTitle: "Not included (separate)",
      getItems: items([
        ["New feature development", "Monthly care is not unlimited build time."],
        ["Large redesigns", "Quoted as a separate project."],
        ["Data migration or server redesign", "Infrastructure work is out of scope."],
        ["New integrations or large performance work", "Needs an extra agreement."],
      ]),
      processTitle: "Example packages (not priced)",
      processItems: items([
        ["BASIC", "Checks and small edits — example name only."],
        ["STANDARD", "Regular care and ops support — example name only."],
        ["CUSTOM", "A contract shaped to the company — example name only."],
      ]),
      deliverTitle: "How work is run",
      deliverItems: ["Request intake", "Work log", "Agreed deploys"],
      whoTitle: "Quotes",
      whoItems: [
        "We do not list prices, monthly hours, or response SLAs until they are agreed.",
        "Quotes follow contract range, volume, system condition, and environment.",
        "Emergency incident response, 24/7 monitoring, and security operations are not listed unless we actually provide them.",
      ],
      faqs: faq([
        ["Is all new development included?", "No. New features are quoted separately."],
        ["Third-party builds?", "After a technical review of feasibility."],
      ]),
      ctaFinalTitle: "Talk about care\nfor a live product.",
      ctaFinalLead: "Share the stack and the support you need.",
      ctaFinalBtn: "Inquire about maintenance →",
    },
  },

  "post-launch": {
    ko: {
      ...COMMON_KO,
      seoTitle: "Post-launch Support | Newon Business",
      metaDescription:
        "출시 직후 배포 상태, 초기 오류, 운영 가이드, 분석 도구, 초기 피드백 개선을 지원합니다. Product Launch와 달리 출시 이후 단계입니다.",
      navLabel: "POST",
      eyebrow: "POST-LAUNCH SUPPORT",
      subEyebrow: "CARE",
      headline: "출시한 직후의\n운영을 안정적으로.",
      lead: "웹·앱 배포 상태 확인, 초기 오류, 운영자 가이드, 분석 도구 설정, 초기 피드백 개선, 업데이트 배포를 지원합니다. 출시 전 제작은 Product Launch에서, 이후 운영은 이 서비스에서 다룹니다. 기간과 범위는 계약에 따릅니다.",
      ctaPrimary: "출시 후 지원 문의 →",
      ctaSecondary: "지원 항목 보기 ↓",
      solveTitle: "출시 이후에 다루는 일",
      solveItems: items([
        ["배포 상태와 초기 오류", "스토어·웹 배포가 살아 있는지, 초기에 무엇이 깨지는지."],
        ["운영자 안내", "관리자가 화면을 쓰는 방법을 정리합니다."],
        ["분석·피드백", "분석 도구 설정과 초기 사용자 의견에 따른 작은 개선."],
      ]),
      getTitle: "Product Launch와 다른 점",
      getItems: items([
        ["Product Launch", "출시 전 제작·배포 준비."],
        ["Post-launch Support", "출시 이후 초기 운영."],
        ["Monthly Maintenance", "그다음의 정기 유지보수 계약."],
      ]),
      processTitle: "진행 과정",
      processItems: items([
        ["CHECK", "배포와 초기 오류를 확인합니다."],
        ["GUIDE", "운영 가이드와 분석 설정을 돕습니다."],
        ["TUNE", "초기 피드백에 따른 합의 개선."],
        ["HANDOFF", "후속 개발 항목을 정리합니다."],
      ]),
      deliverTitle: "결과물",
      deliverItems: ["점검 메모", "운영 가이드", "후속 항목 목록"],
      whoTitle: "범위",
      whoItems: [
        "운영 지원 기간과 세부 범위는 계약에 따라 정해집니다.",
        "대규모 신규 기능은 별도 개선·구축 프로젝트입니다.",
      ],
      faqs: faq([
        ["출시 패키지에 포함되나요?", "Product Launch 범위와 별도입니다. 같은 문의에서 함께 논의할 수 있습니다."],
      ]),
      ctaFinalTitle: "막 출시한 제품의\n초기 운영을 상의하세요.",
      ctaFinalLead: "배포 위치와 지금 보이는 이슈를 알려주세요.",
      ctaFinalBtn: "출시 후 지원 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Post-launch Support | Newon Business",
      metaDescription:
        "After launch: deploy checks, early defects, operator guides, analytics setup, and small feedback-driven fixes. Different from pre-launch Product Launch.",
      navLabel: "POST",
      eyebrow: "POST-LAUNCH SUPPORT",
      subEyebrow: "CARE",
      headline: "Stabilize the first weeks\nafter you ship.",
      lead: "Deploy checks, early defects, operator guides, analytics setup, early feedback fixes, and update releases. Product Launch is before ship; this service is after. Duration follows the contract.",
      ctaPrimary: "Inquire about post-launch →",
      ctaSecondary: "See coverage ↓",
      solveTitle: "What we cover after launch",
      solveItems: items([
        ["Deploy and early defects", "Whether web/store releases are live, and what breaks first."],
        ["Operator guidance", "How admins use the screens."],
        ["Analytics and feedback", "Tool setup and small fixes from early users."],
      ]),
      getTitle: "How it differs",
      getItems: items([
        ["Product Launch", "Build and ship preparation."],
        ["Post-launch Support", "Early operations after ship."],
        ["Monthly Maintenance", "Ongoing care after that."],
      ]),
      processTitle: "Process",
      processItems: items([
        ["CHECK", "Inspect deploy and early defects."],
        ["GUIDE", "Help with ops notes and analytics."],
        ["TUNE", "Agreed tweaks from early feedback."],
        ["HANDOFF", "List follow-up development."],
      ]),
      deliverTitle: "Deliverables",
      deliverItems: ["Check notes", "Ops guide", "Follow-up list"],
      whoTitle: "Scope",
      whoItems: [
        "Duration and detail are set in the contract.",
        "Large new features are a separate improvement or build.",
      ],
      faqs: faq([
        ["Included in the launch package?", "Separate from Product Launch. We can discuss both in one inquiry."],
      ]),
      ctaFinalTitle: "Talk about the first weeks\nafter launch.",
      ctaFinalLead: "Share where it is deployed and what you are seeing.",
      ctaFinalBtn: "Inquire about post-launch →",
    },
  },
};

export function getNewBusinessServiceCopy(slug, lang) {
  const pack = NEW_BUSINESS_SERVICES[slug];
  if (!pack) return null;
  const c = lang === "ko" ? pack.ko : pack.en;
  const hub = {
    "website-renewal": "../build/",
    improvement: "../build/",
    booking: "../automation/",
    maintenance: "../care/",
    "post-launch": "../care/",
  };
  return {
    ...c,
    ctaFinalSecondary: lang === "ko" ? "분류 보기 →" : "View category →",
    ctaFinalSecondaryHref: hub[slug] || "../",
    priceFactors: c.priceFactors ||
      (lang === "ko"
        ? [
            "기본 제공: 합의한 작업 범위",
            "추가 개발: 별도 견적",
            "외부 서비스 비용: 포함되지 않을 수 있음",
            "유지보수: 별도 계약",
          ]
        : [
            "Base scope: agreed work only",
            "Extra development: quoted separately",
            "Third-party fees: may be extra",
            "Maintenance: separate agreement",
          ]),
  };
}
