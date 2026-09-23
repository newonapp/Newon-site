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
        "기존 웹사이트의 구조·콘텐츠·디자인·구현을 범위 안에서 재정비합니다. 특정 기능만 고치는 작업과 다르며, 관리자·결제·서버 이전은 기본에 포함되지 않습니다.",
      navLabel: "RENEWAL",
      eyebrow: "WEBSITE RENEWAL",
      subEyebrow: "BUILD",
      headline: "기존 웹사이트의\n구조와 구현을 재정비합니다.",
      lead: "정보 구조, 콘텐츠, 모바일, 디자인과 프론트 구현을 현재 사업에 맞게 범위 안에서 다시 맞춥니다. 특정 기능만 고치면 웹·앱 개선입니다. 검색 순위·트래픽·매출은 보장하지 않습니다.",
      ctaPrimary: "리뉴얼 문의하기 →",
      ctaSecondary: "작업 범위 보기 ↓",
      solveTitle: "이런 팀에 필요합니다",
      solveItems: items([
        ["정보 구조가 현재 사업과 다르다", "메뉴와 콘텐츠가 지금 하는 일과 맞지 않는 경우."],
        ["모바일과 문의 흐름을 다시 맞춘다", "화면과 문의 경로를 사이트 차원에서 정리하는 경우."],
        ["전면 재제작까지는 아니다", "새 제품을 만드는 대신, 합의한 영역을 재정비하는 경우."],
      ]),
      getTitle: "무엇을 검토하고 만드나요",
      getItems: items([
        ["현황 검토", "구조, 문제점, 모바일, 콘텐츠, 문의 흐름을 확인합니다."],
        ["재정비 범위", "전체 재제작이 아니라, 구조·콘텐츠·화면 중 어디를 맞출지 정합니다."],
        ["합의한 디자인과 구현", "디자인만 넘기지 않습니다. 합의한 화면의 프론트 구현과 기존 문의 연결까지 포함합니다."],
        ["전환 전 확인", "URL, 데이터, 문의, 운영 중단 가능성을 봅니다. 순위 유지는 보장하지 않습니다."],
      ]),
      processTitle: "진행 과정",
      processItems: items([
        ["DISCOVER", "현재 사이트와 운영 목표를 확인합니다."],
        ["SCOPE", "재정비할 영역과 별도 견적 항목을 정합니다."],
        ["DESIGN / BUILD", "합의한 화면과 기능을 수정합니다."],
        ["QA / LAUNCH", "검수 후 배포합니다. 전환이 포함되면 중단 가능성을 먼저 알립니다."],
      ]),
      deliverTitle: "결과물",
      deliverItems: ["개선된 페이지 또는 사이트", "변경 범위 요약", "운영에 필요한 짧은 안내"],
      whoTitle: "선택할 수 있는 유형",
      whoItems: [
        "A. 주요 영역 재정비 — 전체 재제작 없이 구조·콘텐츠·화면을 범위 안에서 다시 맞춤",
        "B. 더 넓은 리뉴얼 — 주요 영역 전반. 관리자·결제·로그인·서버 이전은 기본에 포함되지 않음",
      ],
      faqs: faq([
        ["기간과 비용은 얼마인가요?", "사이트 상태와 재정비 범위를 본 뒤 산정합니다. 기본 견적에 신규 관리자·결제·로그인이 모두 포함되지는 않습니다."],
        ["모든 사이트를 고칠 수 있나요?", "소스·호스팅·권한에 따라 다릅니다. 사전 검토 후 가능 여부를 안내합니다."],
        ["특정 기능만 고치는 것과 같나요?", "아닙니다. 그 작업은 웹·앱 개선입니다. 이 서비스는 사이트 구조와 구현을 더 넓게 재정비합니다."],
      ]),
      ctaFinalTitle: "기존 사이트를\n어떻게 고칠지 이야기해주세요.",
      ctaFinalLead: "URL과 불편한 점을 알려주시면 범위를 함께 정합니다.",
      ctaFinalBtn: "리뉴얼 문의하기 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Website Renewal | Newon Business",
      metaDescription:
        "Restructure an existing website’s information, content, design, and front-end within an agreed range. Not a single-feature fix. New admin, payments, and server moves are extra.",
      navLabel: "RENEWAL",
      eyebrow: "WEBSITE RENEWAL",
      subEyebrow: "BUILD",
      headline: "Restructure the site\nyou already have.",
      lead: "We realign information architecture, content, mobile, design, and front-end implementation to the current business, within an agreed range. A single feature fix is Web & App Improvement. We do not guarantee rankings, traffic, or revenue.",
      ctaPrimary: "Inquire about renewal →",
      ctaSecondary: "See scope ↓",
      solveTitle: "Who this is for",
      solveItems: items([
        ["The structure no longer matches the business", "Menus and content do not describe what you do now."],
        ["Mobile and inquiry need a site-level pass", "Screens and request paths are reorganized together."],
        ["Not a brand-new product", "You want agreed areas renewed, not a new build."],
      ]),
      getTitle: "What we review and deliver",
      getItems: items([
        ["Current-state review", "Structure, issues, mobile, content, and inquiry flow."],
        ["Renewal range", "Which structure, content, and screens to realign — not a full rebuild."],
        ["Agreed design and implementation", "Not design files alone. Front-end for the agreed screens, and the existing inquiry path."],
        ["Before cutover", "We look at URL, data, inquiry, and downtime risk. Rankings are not guaranteed."],
      ]),
      processTitle: "Process",
      processItems: items([
        ["DISCOVER", "Review the live site and goals."],
        ["SCOPE", "Agree the areas to renew and what is quoted separately."],
        ["DESIGN / BUILD", "Change the agreed screens and features."],
        ["QA / LAUNCH", "QA and deploy. If a cutover is in scope, we flag downtime risk first."],
      ]),
      deliverTitle: "Deliverables",
      deliverItems: ["Updated pages or site", "Scope summary", "Short operating notes"],
      whoTitle: "Two types",
      whoItems: [
        "A. Main areas — realign structure, content, and screens without a full rebuild",
        "B. Wider renewal — major areas. New admin, payments, login, and server moves are not in the base scope",
      ],
      faqs: faq([
        ["What does it cost and how long?", "After we see the site and the renewal range. The base quote does not include a new admin, payments, and login."],
        ["Can you change any site?", "It depends on source, hosting, and access. We confirm after a review."],
        ["Is this the same as fixing one feature?", "No. That is Web & App Improvement. This service realigns structure and implementation more broadly."],
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
        "운영 중인 웹·앱의 특정 기능·화면·사용 흐름을 부분적으로 개선합니다. 사이트 전체 리뉴얼이나 월간 유지보수가 아니며, 검토 후 별도 견적합니다.",
      navLabel: "IMPROVE",
      eyebrow: "WEB & APP IMPROVEMENT",
      subEyebrow: "BUILD",
      headline: "운영 중인 웹·앱의\n기능과 화면을 부분 개선합니다.",
      lead: "특정 기능, 사용 흐름, 화면, 재현되는 오류를 필요한 범위만 고칩니다. 사이트 전체 재정비는 웹사이트 리뉴얼입니다. 디자인 산출물은 Studio이고, 코드와 기능 구현은 이 서비스입니다. 소스·환경·권한을 확인한 뒤 견적합니다.",
      ctaPrimary: "개선 문의하기 →",
      ctaSecondary: "확인 항목 보기 ↓",
      solveTitle: "이런 작업을 다룹니다",
      solveItems: items([
        ["쓰다 막히는 기능", "기존 기능과 화면의 불편을 필요한 구간만 고칩니다."],
        ["제한된 기능 추가", "전체를 새로 만들지 않고, 합의한 기능만 더합니다."],
        ["흐름·반응형·연동", "사용 경로, 화면 깨짐, 기존 연동의 부분 수정을 검토합니다."],
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
        "견적에 적은 항목만 진행합니다. 부분 수정과 기능 추가는 같은 금액이 아닙니다.",
        "추가 견적: 대규모 재작성, 스택 교체, 데이터 이전, 신규 연동, 사이트 전체 리뉴얼",
        "월간 유지보수가 아닙니다. 모든 기존 프로젝트를 수정할 수 있다고 보장하지 않습니다.",
      ],
      faqs: faq([
        ["Newon이 만들지 않은 제품도 되나요?", "소스·환경·권한을 본 뒤 가능 여부를 안내합니다. 화면 디자인만 필요하면 Studio이고, 코드 수정은 이 서비스입니다."],
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
        "Change a specific feature, screen, or flow on a website or app you already run. Not a full site renewal or a monthly care plan. Quoted after a technical review.",
      navLabel: "IMPROVE",
      eyebrow: "WEB & APP IMPROVEMENT",
      subEyebrow: "BUILD",
      headline: "Change part of a product\nyou already run.",
      lead: "We fix a specific feature, flow, screen, or reproducible defect — only the agreed part. A full site restructure is Website Renewal. Design files alone are Studio; code and behavior are this service. Quote and schedule follow a review of source, environment, and access.",
      ctaPrimary: "Inquire about improvement →",
      ctaSecondary: "See checklist ↓",
      solveTitle: "What this covers",
      solveItems: items([
        ["A feature that is hard to use", "Fix the existing behavior and screens that block the task."],
        ["A limited addition", "Add only the agreed capability, not a new product."],
        ["Flow, layout, existing links", "Paths, responsive issues, and partial changes to current integrations."],
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
        "Only what the quote lists. A small fix and a new feature are not the same price.",
        "Extra quote: large rewrites, stack changes, data migration, new integrations, full site renewal",
        "This is not monthly maintenance. We do not guarantee every existing project can be modified.",
      ],
      faqs: faq([
        ["Products not built by Newon?", "After we review source, environment, and access. Design-only work is Studio. Code changes are this service."],
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
        "예약·문의·고객 이력을 새로 구축합니다. 기능은 견적에서 정하며, 외부 이용료와 구축 후 유지보수는 별도입니다. 월간 유지보수 요금에 구축이 포함되지 않습니다.",
      navLabel: "BOOKING",
      eyebrow: "BOOKING & CUSTOMER MANAGEMENT",
      subEyebrow: "AUTOMATION",
      headline: "예약·고객 관리를\n새로 구축합니다.",
      lead: "신청·일정·문의·이력을 만드는 신규 구축입니다. 업종을 제한하지 않으며, 미용·교육·스튜디오는 예시입니다. 아래 기능이 모두 기본가에 포함되지는 않습니다. 구축비, 외부 이용료, 이후 유지보수는 각각 별도이고, 월간 유지보수 요금에 구축이 포함되지 않습니다.",
      ctaPrimary: "예약 시스템 문의 →",
      ctaSecondary: "기능 범위 보기 ↓",
      solveTitle: "대상 고객",
      solveItems: items([
        ["예약이 많은 소규모 사업장", "미용, 학원, 촬영, 전문 서비스."],
        ["문의가 흩어져 있는 팀", "전화·메신저·폼이 섞여 이력이 남지 않는 경우."],
        ["웹사이트와 연결이 필요한 경우", "기존 소개 사이트에 신청·관리를 붙이고 싶은 경우."],
      ]),
      getTitle: "견적에서 정하는 기능",
      getItems: items([
        ["온라인 예약 신청", "일정과 상태 변경. 포함 여부는 견적에서 정합니다."],
        ["고객 문의 접수", "유형과 상담 이력. 포함 여부는 견적에서 정합니다."],
        ["관리자 화면", "예약 확인, 배정, 기본 현황. 포함 여부는 견적에서 정합니다."],
        ["알림", "문자·이메일은 계약한 채널만. 이용료는 별도일 수 있습니다."],
        ["기존 웹과 연결", "소개 사이트에서 신청으로 잇는 경로. 포함 여부는 견적에서 정합니다."],
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
        "추가 개발: 온라인 결제, 문자·이메일, 이용 이력, 고객 메모, 권한 구분, 외부 캘린더, 지점, 맞춤 보고서",
        "결제·문자·이메일·캘린더·외부 예약 플랫폼은 연동 가능 여부와 제공업체 요금에 따라 별도입니다.",
        "접근 권한과 데이터 처리 범위는 프로젝트마다 협의합니다. 보안 인증은 보장하지 않습니다. 구축 후 관리는 월간 유지보수 별도 계약입니다.",
      ],
      faqs: faq([
        ["모든 예약을 자동으로 확정하나요?", "아닙니다. 상태 변경과 담당자 확인을 전제로 설계합니다."],
        ["가격은 얼마인가요?", "구축비는 기능과 연동을 본 뒤 별도 견적입니다. 외부 이용료와 이후 유지보수는 포함되지 않습니다."],
      ]),
      ctaFinalTitle: "예약·문의가 어떻게\n들어오는지 알려주세요.",
      ctaFinalLead: "업종과 필요한 기능을 공유해 주시면 구축 범위를 검토합니다.",
      ctaFinalBtn: "예약 시스템 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Booking & Customer Management | Newon Business",
      metaDescription:
        "A new booking and customer-history build. Features are set in the quote. Vendor fees and later maintenance are separate, and are not included in monthly care.",
      navLabel: "BOOKING",
      eyebrow: "BOOKING & CUSTOMER MANAGEMENT",
      subEyebrow: "AUTOMATION",
      headline: "Build booking and\ncustomer management.",
      lead: "A new system for requests, schedules, inquiries, and history. We do not limit it to one industry; salons, schools, and studios are examples. The list below is not all included in a base price. Build fee, vendor fees, and later care are separate. Monthly maintenance does not include this build.",
      ctaPrimary: "Inquire about booking →",
      ctaSecondary: "See features ↓",
      solveTitle: "Who this is for",
      solveItems: items([
        ["Small businesses with many bookings", "Salons, academies, studios, professional services."],
        ["Scattered inquiries", "Phone, chat, and forms with no history."],
        ["Need a link from the website", "Add request and admin flows to an existing site."],
      ]),
      getTitle: "Features set in the quote",
      getItems: items([
        ["Online booking requests", "Schedule and status. Whether it is included is set in the quote."],
        ["Inquiry intake", "Types and history. Whether it is included is set in the quote."],
        ["Admin", "Booking review, assignment, basic status. Set in the quote."],
        ["Notifications", "Only contracted SMS or email. Vendor fees may be extra."],
        ["Link from the current site", "From the brochure site to a request. Set in the quote."],
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
        "Add-ons: payments, SMS/email, visit history, notes, roles, calendars, branches, custom reports",
        "Payments, SMS, email, calendars, and outside booking platforms depend on access and may add vendor fees.",
        "Access and data-handling scope are agreed per project. We do not claim a security certification. Care after launch is a separate monthly contract.",
      ],
      faqs: faq([
        ["Are bookings auto-confirmed?", "No. Status changes assume an owner check."],
        ["Price?", "The build is quoted after features and integrations. Vendor fees and later maintenance are not included."],
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
        "운영 중인 웹·앱을 계약 범위에서 정기적으로 관리합니다. 일회성 수정이 아니며, 월 요금·포함 시간·대응 시간은 상담 후 정합니다.",
      navLabel: "CARE",
      eyebrow: "MONTHLY MAINTENANCE",
      subEyebrow: "CARE",
      headline: "일회성 수정이 아니라\n계약 범위의 정기 관리입니다.",
      lead: "운영 중인 웹사이트, 웹서비스, 모바일 앱을 월 단위로 관리합니다. 타사 제작은 소스·환경·권한을 본 뒤 가능 여부를 안내합니다. 월 요금, 포함 시간, 대응 시간, 최소 기간은 상담 후 계약으로 정하며 미리 게시하지 않습니다.",
      ctaPrimary: "유지보수 문의 →",
      ctaSecondary: "포함 범위 보기 ↓",
      solveTitle: "계약 범위에서 다루는 일",
      solveItems: items([
        ["오류 확인과 수정", "운영 중 재현되는 이슈를 계약 범위에서 확인·수정합니다."],
        ["정상 작동 점검", "합의한 주기로 주요 기능과 운영 환경·연동 상태를 살펴봅니다."],
        ["경미한 수정", "텍스트, 이미지, 작은 화면 수정. 대규모 개편은 아닙니다."],
        ["배포와 내역", "합의한 업데이트 배포와 작업 결과 안내."],
      ]),
      getTitle: "포함되지 않는 작업 (별도)",
      getItems: items([
        ["신규 기능 개발", "월간 유지보수에 무제한 개발이 포함되지 않습니다."],
        ["대규모 개편·웹사이트 리뉴얼", "별도 프로젝트로 견적합니다."],
        ["데이터 이전·서버 이전·구조 변경", "인프라 작업은 범위 밖입니다."],
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
        "월 요금, 포함 시간, 대응 시간, 최소 계약 기간, 종료 절차는 확정 전 표시하지 않고 상담 후 계약으로 정합니다.",
        "견적은 범위, 작업량, 시스템 상태에 따릅니다. 범위를 넘는 작업은 추가 견적입니다.",
        "24시간 모니터링, 즉시 장애 복구, 무제한 수정, 모든 오류 해결 보장은 제공하지 않습니다.",
      ],
      faqs: faq([
        ["모든 신규 개발이 포함되나요?", "아닙니다. 신규 기능은 별도 견적입니다."],
        ["외부 업체가 만든 제품도 되나요?", "소스·운영 환경·접근 권한을 검토한 뒤 가능 여부를 안내합니다. 모든 스택을 보장하지 않습니다."],
      ]),
      ctaFinalTitle: "운영 중인 웹·앱의\n유지보수를 상의하세요.",
      ctaFinalLead: "스택과 필요한 지원 범위를 알려주시면 검토합니다.",
      ctaFinalBtn: "유지보수 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Monthly Maintenance | Newon Business",
      metaDescription:
        "Ongoing care for a live website or app, inside a contract. Not a one-off fix. Monthly fee, included time, and response time are set in consultation.",
      navLabel: "CARE",
      eyebrow: "MONTHLY MAINTENANCE",
      subEyebrow: "CARE",
      headline: "Ongoing care,\nnot a one-off fix.",
      lead: "A monthly contract for a live website, web app, or mobile app. Third-party builds are reviewed for source, environment, and access. Fee, included time, response time, and minimum term are set in the contract and not published in advance.",
      ctaPrimary: "Inquire about maintenance →",
      ctaSecondary: "See what is included ↓",
      solveTitle: "What a contract can cover",
      solveItems: items([
        ["Defects", "Review and fix reproducible issues inside the contract."],
        ["Health checks", "Agreed checks of main features, environment, and connections."],
        ["Small edits", "Copy, images, minor layout. Not a redesign."],
        ["Deploys and a log", "Agreed releases and a note of what was done."],
      ]),
      getTitle: "Not included (separate)",
      getItems: items([
        ["New feature development", "Monthly care is not unlimited build time."],
        ["Large redesigns and site renewal", "Quoted as a separate project."],
        ["Data moves, server moves, structural changes", "Infrastructure work is out of scope."],
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
        "Monthly fee, included time, response time, minimum term, and how a contract ends are set in consultation and not listed before that.",
        "Quotes follow scope, volume, and system condition. Work outside the contract is an extra quote.",
        "We do not offer 24/7 monitoring, instant recovery, unlimited edits, or a promise to fix every defect.",
      ],
      faqs: faq([
        ["Is all new development included?", "No. New features are quoted separately."],
        ["Third-party builds?", "After we review source, environment, and access. We do not support every stack."],
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
        "출시 직후의 초기 오류 점검과 운영 전환을 지원합니다. 월간 유지보수의 정기 계약이 아니며, 스토어 심사 통과는 보장하지 않습니다.",
      navLabel: "POST",
      eyebrow: "POST-LAUNCH SUPPORT",
      subEyebrow: "CARE",
      headline: "출시 직후의\n초기 안정화와 운영 전환.",
      lead: "배포 확인, 초기 오류, 주요 기능 점검, 운영 가이드, 합의된 초기 수정을 지원합니다. 월간 유지보수의 정기 계약이 아닙니다. 무상 기간은 계약에 있을 때만 적용합니다. 스토어 심사 통과나 출시 성과는 보장하지 않습니다.",
      ctaPrimary: "출시 후 지원 문의 →",
      ctaSecondary: "지원 항목 보기 ↓",
      solveTitle: "출시 이후에 다루는 일",
      solveItems: items([
        ["배포 상태와 초기 오류", "웹·스토어 배포가 살아 있는지, 출시 직후 무엇이 깨지는지 확인합니다."],
        ["주요 기능과 운영 안내", "핵심 흐름이 도는지 보고, 관리자 사용 방법을 정리합니다."],
        ["초기 피드백", "초기 의견을 개선 항목으로 정리하고, 합의한 수정만 진행합니다. 심사 통과는 보장하지 않습니다."],
      ]),
      getTitle: "Product Launch와 다른 점",
      getItems: items([
        ["Product Launch", "출시 전 제작·배포 준비."],
        ["Post-launch Support", "출시 직후 안정화와 운영 전환. 정기 계약이 아닙니다."],
        ["Monthly Maintenance", "그 이후의 지속적인 정기 관리."],
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
        "기간과 비용은 개발 계약이나 Product Launch에 자동 포함되지 않습니다. 별도 계약으로 정합니다.",
        "대규모 기능은 웹·앱 개선 등 별도 견적입니다. 무상 횟수는 계약에 없으면 게시하지 않습니다.",
      ],
      faqs: faq([
        ["출시 패키지에 포함되나요?", "Product Launch와 별도입니다. 무상 기간·수정 횟수는 계약에 없으면 게시하지 않습니다. 심사 통과는 보장하지 않습니다."],
      ]),
      ctaFinalTitle: "막 출시한 제품의\n초기 운영을 상의하세요.",
      ctaFinalLead: "배포 위치와 지금 보이는 이슈를 알려주세요.",
      ctaFinalBtn: "출시 후 지원 문의 →",
    },
    en: {
      ...COMMON_EN,
      seoTitle: "Post-launch Support | Newon Business",
      metaDescription:
        "Checks and stabilization in the first period after launch. Not a monthly care contract. Store approval and launch results are not guaranteed.",
      navLabel: "POST",
      eyebrow: "POST-LAUNCH SUPPORT",
      subEyebrow: "CARE",
      headline: "Steady the first period\nafter launch.",
      lead: "Deploy checks, early defects, core-flow checks, operator notes, and agreed early fixes. This is not the monthly maintenance contract. A free period applies only if the contract says so. We do not guarantee store approval or launch results.",
      ctaPrimary: "Inquire about post-launch →",
      ctaSecondary: "See coverage ↓",
      solveTitle: "What we cover after launch",
      solveItems: items([
        ["Deploy and early defects", "Whether the web or store release is live, and what breaks first."],
        ["Core flows and operator notes", "Check the main path and write how admins use it."],
        ["Early feedback", "Turn early comments into a list, and change only what was agreed. Approval is not guaranteed."],
      ]),
      getTitle: "How it differs",
      getItems: items([
        ["Product Launch", "Build and ship preparation."],
        ["Post-launch Support", "Stabilization right after launch. Not an ongoing contract."],
        ["Monthly Maintenance", "Regular care after that period."],
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
        "Duration and cost are not automatic parts of the build contract or Product Launch. They are a separate agreement.",
        "Large features are a separate improvement quote. Free rounds are not listed unless the contract includes them.",
      ],
      faqs: faq([
        ["Included in the launch package?", "Separate from Product Launch. Free time and fix counts are not published unless the contract includes them. Store approval is not guaranteed."],
      ]),
      ctaFinalTitle: "Talk about the first weeks\nafter launch.",
      ctaFinalLead: "Share where it is deployed and what you are seeing.",
      ctaFinalBtn: "Inquire about post-launch →",
    },
  },
};

const PRICE_FACTORS = {
  maintenance: {
    ko: [
      "월 요금: 상담 후 계약. 확정 금액은 게시하지 않음",
      "포함 시간·대응 시간·최소 기간: 계약 전 표시하지 않음",
      "범위를 넘는 개발·리뉴얼: 추가 견적",
      "서버·호스팅·외부 이용료: 포함되지 않을 수 있음",
    ],
    en: [
      "Monthly fee: set in the contract, not published in advance",
      "Included time, response time, minimum term: not listed until agreed",
      "Work beyond the contract, including renewal: extra quote",
      "Hosting and third-party fees: may be extra",
    ],
  },
  "post-launch": {
    ko: [
      "기간과 비용: 개발 계약·Product Launch에 자동 포함되지 않음",
      "무상 기간·수정 횟수: 계약에 없으면 게시하지 않음",
      "대규모 기능: 별도 견적",
      "외부 이용료: 포함되지 않을 수 있음",
    ],
    en: [
      "Duration and cost: not automatic in the build contract or Product Launch",
      "Free period and fix counts: unpublished unless the contract includes them",
      "Large features: extra quote",
      "Third-party fees: may be extra",
    ],
  },
  improvement: {
    ko: [
      "견적: 소스·환경·권한 검토 후. 단일 시작가로 모든 규모를 커버하지 않음",
      "진행: 견적에 적은 부분 수정·기능만",
      "대규모 재작성·사이트 리뉴얼: 별도",
      "외부 비용: 포함되지 않을 수 있음",
    ],
    en: [
      "Quote after source, environment, and access. One starting price does not cover every size",
      "Work: only the partial edits and features listed in the quote",
      "Large rewrites and site renewal: separate",
      "Third-party fees: may be extra",
    ],
  },
  "website-renewal": {
    ko: [
      "견적: 현황과 재정비 범위를 확인한 뒤",
      "포함: 합의한 구조·콘텐츠·디자인·프론트 구현",
      "관리자·결제·로그인·서버 이전: 별도",
      "외부 비용과 이후 유지보수: 별도",
    ],
    en: [
      "Quote after the current site and renewal range are reviewed",
      "Included: agreed structure, content, design, and front-end",
      "New admin, payments, login, server move: separate",
      "Third-party fees and later care: separate",
    ],
  },
  booking: {
    ko: [
      "구축비: 기능과 연동을 본 뒤 별도 견적",
      "문자·결제·캘린더 등 외부 이용료: 별도일 수 있음",
      "구축 후 유지보수: 월간 계약으로 별도",
      "기능 목록은 전부 기본 포함이 아니라 견적에서 확정",
    ],
    en: [
      "Build fee: quoted after features and integrations",
      "SMS, payments, calendars, and other vendor fees: may be extra",
      "Care after the build: a separate monthly contract",
      "The feature list is confirmed in the quote, not all included by default",
    ],
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
    priceFactors:
      PRICE_FACTORS[slug]?.[lang === "ko" ? "ko" : "en"] ||
      c.priceFactors ||
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
