/**
 * KO/EN copy for Newon Business service detail pages.
 * Slugs: mvp | web | landing | app | ai-automation | data-reporting | internal-tools | white-label | design
 */
import { getLandingCopy } from "./business-service-landing-copy.mjs";
import { getDataReportingCopy } from "./data-reporting-copy.mjs";
import { getInternalToolsCopy } from "./internal-tools-copy.mjs";
import { getWorkflowAutomationCopy } from "./workflow-automation-copy.mjs";
import { USE_CASE_FLOWS } from "./business-use-case-flows.mjs";
import { getMarketResearchCopy } from "./market-research-copy.mjs";
import { getCompetitorAnalysisCopy } from "./competitor-analysis-copy.mjs";
import { getConsumerResearchCopy } from "./consumer-research-copy.mjs";
import { getUxAuditCopy } from "./ux-audit-copy.mjs";
import { getTrendResearchCopy } from "./trend-research-copy.mjs";
import { getCustomProductCopy } from "./custom-product-copy.mjs";
import { getProductLaunchCopy } from "./product-launch-copy.mjs";
import { getInternalSystemCopy } from "./internal-system-copy.mjs";
import { getMvpCopy } from "./mvp-copy.mjs";
import { getWebCopy } from "./web-copy.mjs";
import { getAppCopy } from "./app-copy.mjs";
import { getAiAutomationCopy } from "./ai-automation-copy.mjs";
import { getWhiteLabelCopy } from "./white-label-copy.mjs";
import {
  applyServicePricing,
  externalCostDisclaimer,
  hasExternalCost,
  scopeDisclaimer,
} from "./business-pricing.mjs";
import { applyKoSectionLabels } from "./business-section-labels.mjs";

const COPY = {
  ko: {
    mvp: {
      seoTitle: "MVP Development | Newon Business",
      metaDescription:
        "아이디어를 빠르게 검증할 수 있는 실제 제품으로 만듭니다. 기획부터 UX, 개발, 배포까지 Newon과 함께 진행하세요.",
      eyebrow: "MVP DEVELOPMENT",
      subEyebrow: "FROM IDEA TO PRODUCT",
      headline: "아이디어를\n실제 제품으로.",
      lead: "아이디어 검증부터 핵심 기능 정의, UI/UX, 개발, 테스트, 출시까지. 초기 제품을 빠르게 실제 사용자에게 전달할 수 있도록 설계합니다.",
      ctaPrimary: "MVP 개발 문의하기 →",
      ctaSecondary: "프로세스 보기 ↓",
      navLabel: "MVP",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "아이디어만 있고 형태가 없다",
          body: "무엇을 먼저 만들지 정하지 못한 상태에서, 검증에 필요한 최소 제품 구조를 정리합니다.",
        },
        {
          n: "02",
          title: "처음부터 크게 만들면 위험하다",
          body: "기능이 많아지면 출시가 늦어집니다. 핵심 흐름만 남겨 빠르게 시장에 내보냅니다.",
        },
        {
          n: "03",
          title: "기획·디자인·개발이 끊긴다",
          body: "외주처럼 단계만 넘기는 방식이 아니라, 기획부터 배포까지 한 흐름으로 이어갑니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "문제 정의와 범위",
          body: "해결할 문제, 주요 사용자, MVP에 넣을 기능과 빼야 할 기능을 함께 정합니다.",
        },
        {
          n: "02",
          title: "제품 구조와 UX 흐름",
          body: "화면 단위가 아니라 사용자가 목표를 달성하는 경로를 기준으로 구조를 잡습니다.",
        },
        {
          n: "03",
          title: "동작하는 제품",
          body: "데모 슬라이드가 아닌, 실제로 클릭하고 입력해볼 수 있는 Web 또는 App MVP를 만듭니다.",
        },
        {
          n: "04",
          title: "기본 백엔드와 데이터",
          body: "로그인, 저장, 조회처럼 검증에 필요한 최소 서버·데이터 구조를 포함합니다.",
        },
        {
          n: "05",
          title: "배포와 공유 환경",
          body: "팀에 공유하거나 초기 사용자에게 보여줄 수 있는 배포 환경을 준비합니다.",
        },
        {
          n: "06",
          title: "다음 단계 로드맵",
          body: "MVP 이후 무엇을 확장할지, 무엇을 보류할지 우선순위를 정리해 전달합니다.",
        },
      ],
      processTitle: "MVP는 이렇게 만들어집니다.",
      processItems: [
        { n: "01", title: "DISCOVERY", body: "아이디어와 해결하려는 문제를 정리합니다." },
        { n: "02", title: "SCOPE", body: "첫 버전에 필요한 핵심 기능을 결정합니다." },
        { n: "03", title: "UX", body: "사용자의 핵심 흐름을 설계합니다." },
        { n: "04", title: "DESIGN", body: "실제 제품 인터페이스를 만듭니다." },
        { n: "05", title: "DEVELOPMENT", body: "작동하는 제품을 개발합니다." },
        { n: "06", title: "LAUNCH", body: "테스트 후 실제 환경에 배포합니다." },
      ],
      demoLabel: "PRODUCT PIPELINE",
      demoBadge: "DEMO PROJECT",
      scopeTitle: "처음부터 모든 것을\n만들 필요는 없습니다.",
      scopeLead: "첫 버전에서는 검증에 필요한 것만 남깁니다. 나머지는 출시 후, 혹은 검증 이후에 결정합니다.",
      scopeItems: [
        { key: "CORE", title: "CORE", body: "반드시 필요한 핵심 기능" },
        { key: "NEXT", title: "NEXT", body: "출시 후 추가할 기능" },
        { key: "LATER", title: "LATER", body: "검증 후 결정할 기능" },
      ],
      buildGridEyebrow: "CAPABILITY",
      buildGridTitle: "WHAT WE CAN BUILD",
      buildGridLead: "검증에 필요한 첫 제품의 형태를 고릅니다. 플랫폼이 아니라 배움의 속도가 기준입니다.",
      buildGridMeta: "06 FORMS",
      buildGrid: [
        {
          tag: "WEB",
          title: "Web MVP",
          body: "웹에서 바로 쓰는 핵심 플로우. 가입·사용·전환까지.",
        },
        {
          tag: "APP",
          title: "Mobile App MVP",
          body: "모바일에서만 성립하는 습관·알림·현장 경험.",
        },
        {
          tag: "OPS",
          title: "Internal Tool",
          body: "팀이 매일 쓰는 운영 도구. 속도와 정확도 우선.",
        },
        {
          tag: "AI",
          title: "AI Product",
          body: "반복 업무를 줄이는 AI 기능. 모델보다 워크플로.",
        },
        {
          tag: "EXP",
          title: "Prototype",
          body: "투자·팀 설득용 클릭 가능한 시연. 빠르게, 선명하게.",
        },
        {
          tag: "GO",
          title: "Landing + Product",
          body: "설득용 랜딩과 실제 제품 진입을 한 흐름으로.",
        },
      ],
      demo: {
        project: { label: "PROJECT", value: "Demo MVP" },
        status: { label: "PROJECT STATUS", value: "BUILDING" },
        progress: { label: "CURRENT STAGE", value: "BUILD" },
        features: { label: "SCOPE", value: "CORE ONLY" },
        next: { label: "NEXT", value: "QA TEST" },
      },
      deliverTitle: "전달물",
      deliverItems: [
        "범위 정의서",
        "UX 플로우 / 화면 구조",
        "동작하는 MVP (Web 또는 App)",
        "기본 백엔드·데이터 구조",
        "배포 환경",
        "다음 단계 우선순위",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "아이디어는 있지만 무엇부터 만들지 정하지 못한 팀",
        "빠르게 시장 반응을 확인하고 싶은 스타트업·사내 신사업",
        "과도한 기능 없이 핵심만 출시하고 싶은 경우",
        "기획부터 배포까지 한 파트너와 진행하고 싶은 경우",
        "기존 외주 산출물이 데모 수준에 머물러 있는 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "기획서가 없어도 시작할 수 있나요?",
          a: "가능합니다. 아이디어와 해결하고 싶은 문제만 있어도 범위를 함께 정리할 수 있습니다.",
        },
        {
          q: "웹과 앱 중 무엇을 만들까요?",
          a: "검증 목표와 사용자 환경에 맞춰 제안합니다. 처음부터 둘 다 만들지는 않습니다.",
        },
        {
          q: "기간은 얼마나 걸리나요?",
          a: "범위에 따라 다릅니다. 문의 내용을 확인한 뒤 일정 감을 안내드립니다.",
        },
        {
          q: "견적은 바로 알 수 있나요?",
          a: "기능 범위와 플랫폼에 따라 달라집니다. 확정 금액을 웹에 고정해 두지 않으며, 검토 후 안내드립니다.",
        },
        {
          q: "MVP 이후 확장도 가능한가요?",
          a: "가능합니다. MVP에서 검증된 흐름을 기준으로 기능을 확장하거나 개선할 수 있습니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      ctaFinalTitle: "READY TO BUILD?\n아이디어를\n첫 번째 제품으로 만들어보세요.",
      ctaFinalLead: "만들고 싶은 서비스와 현재 단계만 알려주셔도 됩니다.",
      ctaFinalBtn: "MVP 프로젝트 문의하기 →",
      scrollProcess: "프로세스 보기 ↓",
      crumbBusiness: "BUSINESS",
      crumbServices: "SERVICES",
      prevLabel: "PREVIOUS SERVICE",
      nextLabel: "NEXT SERVICE",
    },

    web: {
      seoTitle: "Web Development | Newon Business",
      metaDescription:
        "브랜드와 서비스를 설명하는 완성도 높은 웹을 만듭니다. 회사 사이트, 랜딩, 서비스 웹까지 Newon과 함께.",
      eyebrow: "WEB DEVELOPMENT",
      subEyebrow: "DESIGN / BUILD / LAUNCH",
      headline: "브랜드와 제품을 위한\n웹을 만듭니다.",
      lead: "브랜드 사이트부터 랜딩 페이지, 제품 소개 웹과 웹 서비스까지 목적에 맞는 디지털 경험을 설계하고 개발합니다.",
      ctaPrimary: "웹 프로젝트 문의하기 →",
      ctaSecondary: "작업 범위 보기 ↓",
      navLabel: "WEB",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "사이트는 있는데 브랜드가 안 보인다",
          body: "템플릿처럼 보이는 구성을 정리하고, 브랜드와 서비스가 한눈에 읽히도록 재구성합니다.",
        },
        {
          n: "02",
          title: "모바일에서 깨지고 찾기 어렵다",
          body: "반응형 구조와 정보 위계를 다시 잡아 데스크톱과 모바일 모두에서 읽히게 만듭니다.",
        },
        {
          n: "03",
          title: "문의·전환까지 연결되지 않는다",
          body: "소개에서 멈추지 않고, 문의·신청·탐색으로 자연스럽게 이어지는 흐름을 설계합니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "사이트 구조와 IA",
          body: "메뉴, 페이지 역할, 콘텐츠 우선순위를 정리해 방문자가 길을 잃지 않게 합니다.",
        },
        {
          n: "02",
          title: "브랜드에 맞는 UI",
          body: "톤, 타이포, 여백, 컴포넌트를 맞춰 템플릿이 아닌 브랜드 사이트로 보이게 합니다.",
        },
        {
          n: "03",
          title: "반응형 구현",
          body: "주요 디바이스에서 레이아웃과 가독성이 유지되도록 구현합니다.",
        },
        {
          n: "04",
          title: "핵심 페이지 제작",
          body: "홈, 소개, 서비스, 문의 등 목적에 필요한 페이지를 완성합니다.",
        },
        {
          n: "05",
          title: "기본 SEO·메타 설정",
          body: "제목, 설명, OG 등 기본 검색·공유 설정을 포함합니다.",
        },
        {
          n: "06",
          title: "문의·전환 연결",
          body: "폼, 메일, 비즈니스 문의 등 실제 다음 행동으로 이어지게 연결합니다.",
        },
      ],
      processTitle: "진행 방식",
      processItems: [
        {
          n: "01",
          title: "목적 정의",
          body: "브랜드 소개인지, 리드 확보인지, 서비스 설명인지 목표를 먼저 맞춥니다.",
        },
        {
          n: "02",
          title: "구조 설계",
          body: "페이지 맵과 섹션 구성을 잡고 콘텐츠 필요 목록을 정리합니다.",
        },
        {
          n: "03",
          title: "디자인",
          body: "핵심 화면의 비주얼과 타이포 시스템을 확정합니다.",
        },
        {
          n: "04",
          title: "구현",
          body: "반응형 웹으로 구현하고, 인터랙션과 문의 흐름을 연결합니다.",
        },
        {
          n: "05",
          title: "검수와 배포",
          body: "브라우저·디바이스 점검 후 배포하고 운영에 필요한 안내를 전달합니다.",
        },
      ],
      demoLabel: "DEMO",
      typesTitle: "만들 수 있는 웹 유형",
      types: [
        {
          n: "01",
          title: "회사·스튜디오 홈페이지",
          body: "무엇을 하는 팀인지, 어떤 방식으로 일하는지 선명하게 보여주는 기업 웹.",
        },
        {
          n: "02",
          title: "브랜드 사이트",
          body: "제품보다 세계관과 톤이 먼저 전달되어야 하는 브랜드 중심 웹.",
        },
        {
          n: "03",
          title: "서비스 랜딩",
          body: "한 제품·캠페인의 가치와 CTA에 집중한 랜딩 페이지.",
        },
        {
          n: "04",
          title: "포트폴리오·케이스 웹",
          body: "작업물과 과정을 설득력 있게 보여주는 아카이브형 웹.",
        },
        {
          n: "05",
          title: "문의·채용 허브",
          body: "협업 문의, 채용, 파트너십 등 전환 목적의 허브 페이지.",
        },
      ],
      responsiveTitle: "RESPONSIVE BY DEFAULT",
      responsiveLead: "같은 사이트가 Desktop · Tablet · Mobile에서 실제로 재배치되는 프리뷰입니다.",
      railTitle: "FROM STRUCTURE TO LAUNCH",
      buildTitle: "구현에 포함하는 것",
      buildItems: [
        "정보 구조와 네비게이션",
        "핵심 페이지 UI",
        "반응형 레이아웃",
        "폼·CTA 연결",
        "기본 SEO / OG",
        "배포 및 도메인 연결 지원",
      ],
      qualityTitle: "BUILT FOR THE REAL WEB",
      quality: [
        {
          title: "위계",
          body: "첫 화면에서 브랜드와 한 문장이 먼저 읽히도록 타이포와 여백을 잡습니다.",
        },
        {
          title: "일관성",
          body: "버튼, 섹션, 카드(필요 시) 규칙이 페이지마다 흔들리지 않게 맞춥니다.",
        },
        {
          title: "속도감",
          body: "불필요한 장식과 무거운 요소를 줄여 콘텐츠가 빠르게 보이게 합니다.",
        },
        {
          title: "모바일 우선",
          body: "좁은 화면에서도 핵심 CTA와 문장이 잘리거나 밀리지 않게 합니다.",
        },
        {
          title: "운영 가능",
          body: "출시 후 문구·이미지 교체가 가능한 구조를 우선합니다.",
        },
      ],
      deliverTitle: "전달물",
      deliverItems: [
        "사이트맵 / IA",
        "디자인된 핵심 화면",
        "반응형 웹 구현물",
        "문의·전환 연결",
        "기본 SEO 설정",
        "배포 환경",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "브랜드를 제대로 보여주는 공식 웹이 필요한 기업·스튜디오",
        "랜딩은 있지만 전환이 약한 팀",
        "모바일 경험이 부족한 기존 사이트를 개선하려는 경우",
        "서비스·비즈니스 문의까지 한 사이트에서 받고 싶은 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "콘텐츠(문구·이미지)도 작성해주나요?",
          a: "구조와 초안 방향은 함께 잡을 수 있습니다. 최종 브랜드 문장과 자료는 팀과 협의해 반영합니다.",
        },
        {
          q: "기존 사이트를 리뉴얼할 수도 있나요?",
          a: "가능합니다. 유지할 페이지와 다시 만들 범위를 나눠 진행합니다.",
        },
        {
          q: "CMS나 관리자 페이지도 포함되나요?",
          a: "필요 여부에 따라 다릅니다. 운영 방식에 맞춰 범위를 정합니다.",
        },
        {
          q: "다국어 사이트도 가능한가요?",
          a: "가능합니다. 언어 구조와 전환 UX를 포함해 설계합니다.",
        },
        {
          q: "호스팅은 어떻게 하나요?",
          a: "프로젝트에 맞는 배포 방식을 안내하고 연결을 지원합니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      ctaFinalTitle: "브랜드가 선명한 웹을 만들어보세요.",
      ctaFinalLead: "만들고 싶은 사이트 유형과 현재 자료만 알려주셔도 됩니다.",
      ctaFinalBtn: "웹 프로젝트 문의 →",
      scrollProcess: "진행 방식 보기 ↓",
      demoBadge: "DEMO DATA",
    },

    app: {
      seoTitle: "App Development | Newon Business",
      metaDescription:
        "iOS와 Android에서 실제로 쓰이는 앱을 기획하고 개발합니다. 출시와 스토어 준비까지 Newon과 함께.",
      eyebrow: "APP DEVELOPMENT",
      subEyebrow: "iOS / ANDROID",
      headline: "아이디어를\n손안의 제품으로.",
      lead: "기획과 사용자 경험부터 개발, 테스트와 앱스토어 출시까지 하나의 제품 과정으로 연결합니다.",
      ctaPrimary: "앱 개발 문의하기 →",
      ctaSecondary: "프로세스 보기 ↓",
      navLabel: "APP",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "아이디어는 있는데 앱으로 어떻게 만들지 모른다",
          body: "핵심 기능과 화면 흐름을 정리해, 출시 가능한 앱 범위로 재구성합니다.",
        },
        {
          n: "02",
          title: "디자인과 개발이 따로 논다",
          body: "UX 구조와 구현을 한 흐름으로 맞춰 실제 기기에서 자연스럽게 동작하게 합니다.",
        },
        {
          n: "03",
          title: "출시 준비가 막막하다",
          body: "스토어 등록, 심사에 필요한 기본 준비까지 제품 제작과 이어서 진행합니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "앱 범위와 기능 정의",
          body: "첫 버전에 넣을 기능과 이후 확장 기능을 구분해 로드맵을 잡습니다.",
        },
        {
          n: "02",
          title: "모바일 UX / UI",
          body: "터치 환경에 맞는 흐름과 화면을 설계합니다.",
        },
        {
          n: "03",
          title: "iOS · Android 구현",
          body: "목적에 맞는 방식으로 모바일 앱을 개발합니다.",
        },
        {
          n: "04",
          title: "API · 데이터 연동",
          body: "로그인, 저장, 알림 등 서비스에 필요한 연동을 포함합니다.",
        },
        {
          n: "05",
          title: "테스트 빌드",
          body: "내부 검증용 빌드를 공유해 실기기에서 확인할 수 있게 합니다.",
        },
        {
          n: "06",
          title: "스토어 출시 지원",
          body: "앱 정보, 스크린샷 구성, 제출 흐름 등 출시 준비를 돕습니다.",
        },
      ],
      processTitle: "진행 방식",
      processItems: [
        {
          n: "01",
          title: "제품 정의",
          body: "누구를 위한 앱인지, 첫 버전의 핵심 가치가 무엇인지 정리합니다.",
        },
        {
          n: "02",
          title: "플로우와 UI",
          body: "온보딩부터 핵심 과업까지 화면 흐름을 설계합니다.",
        },
        {
          n: "03",
          title: "개발",
          body: "합의된 범위로 앱과 필요한 서버 연동을 구현합니다.",
        },
        {
          n: "04",
          title: "테스트",
          body: "주요 시나리오와 기기 환경을 점검합니다.",
        },
        {
          n: "05",
          title: "스토어 제출",
          body: "스토어 페이지와 빌드를 준비해 심사를 진행합니다.",
        },
        {
          n: "06",
          title: "출시 후 개선",
          body: "초기 피드백을 반영해 다음 업데이트를 계획합니다.",
        },
      ],
      demoLabel: "DEMO",
      platformTitle: "플랫폼",
      platforms: ["iOS", "Android", "Cross-platform (Flutter 등)", "API / Backend"],
      typesTitle: "앱 유형",
      appTypes: [
        "신규 모바일 서비스",
        "기존 웹의 모바일 앱화",
        "내부 운영·업무용 앱",
        "기존 앱 개선·리디자인",
        "MVP 모바일 앱",
      ],
      storeTitle: "스토어 출시 단계",
      storeSteps: [
        "앱 정보·카테고리 정리",
        "스크린샷·미리보기 구성",
        "개인정보 처리·권한 설명",
        "빌드 업로드 및 심사 제출",
        "출시 후 버전 관리",
      ],
      previewScreens: [
        { label: "01", title: "Onboarding" },
        { label: "02", title: "Home" },
        { label: "03", title: "Core Action" },
        { label: "04", title: "Settings" },
      ],
      deliverTitle: "전달물",
      deliverItems: [
        "기능 범위 정의",
        "모바일 UX / UI",
        "iOS · Android 앱 빌드",
        "API · 데이터 연동",
        "테스트 배포",
        "스토어 출시 지원",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "모바일에서 서비스를 출시하려는 팀",
        "웹은 있지만 앱이 필요한 서비스",
        "기존 앱의 UX·기능을 개선하고 싶은 경우",
        "기획부터 스토어 출시까지 한 번에 진행하고 싶은 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "네이티브와 크로스플랫폼 중 무엇을 쓰나요?",
          a: "제품 목적, 일정, 유지보수 방식에 맞춰 제안합니다. 특정 스택을 전제로 강요하지 않습니다.",
        },
        {
          q: "앱스토어 개발자 계정은 누가 준비하나요?",
          a: "일반적으로 고객사 계정으로 진행합니다. 준비 방법을 안내드립니다.",
        },
        {
          q: "백엔드도 함께 만드나요?",
          a: "앱에 필요하면 포함합니다. 범위는 기능 정의 단계에서 확정합니다.",
        },
        {
          q: "출시 후 유지보수도 가능한가요?",
          a: "가능합니다. 업데이트 주기와 범위를 별도로 협의합니다.",
        },
        {
          q: "디자인만 맡길 수도 있나요?",
          a: "앱 UI/UX만 필요한 경우 Design 서비스로 진행할 수 있습니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      ctaFinalTitle: "스토어에 올릴 수 있는 앱으로 시작해보세요.",
      ctaFinalLead: "만들고 싶은 앱과 참고 서비스만 있어도 충분합니다.",
      ctaFinalBtn: "앱 개발 문의 →",
      scrollProcess: "진행 방식 보기 ↓",
      demoBadge: "DEMO DATA",
    },

    "ai-automation": {
      seoTitle: "AI Automation | Newon Business",
      metaDescription:
        "반복 업무와 고객 응대를 AI로 자동화합니다. 문의, 리뷰, 콘텐츠, 문서, 사내 업무까지 실제 워크플로에 연결합니다.",
      eyebrow: "AI AUTOMATION",
      subEyebrow: "INTELLIGENT WORKFLOWS",
      headline: "반복되는 일을\n시스템에게 맡기세요.",
      lead: "반복 업무를 분석하고 AI와 자동화를 실제 업무 흐름에 연결합니다.",
      ctaPrimary: "AI 자동화 문의하기 →",
      ctaSecondary: "진행 방식 보기 ↓",
      navLabel: "AI",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "같은 문의와 작업을 사람이 반복한다",
          body: "반복되는 질문·분류·초안 작성을 자동화해 사람이 판단이 필요한 일에 집중하게 합니다.",
        },
        {
          n: "02",
          title: "AI를 쓰고 싶지만 어디에 붙일지 모른다",
          body: "업무를 분해해 자동화 가치가 큰 지점부터 연결합니다.",
        },
        {
          n: "03",
          title: "도구만 늘고 워크플로가 안 바뀐다",
          body: "단발 실험이 아니라 기존 시스템·채널과 이어지는 흐름으로 설계합니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "자동화 기회 정리",
          body: "현재 업무 중 AI가 도울 수 있는 구간과 사람이 남겨야 할 구간을 나눕니다.",
        },
        {
          n: "02",
          title: "워크플로 설계",
          body: "입력 → 처리 → 검수 → 결과까지의 흐름을 문서화합니다.",
        },
        {
          n: "03",
          title: "AI 기능 구현",
          body: "문의 응대, 요약, 분류, 초안 생성 등 목적에 맞는 기능을 만듭니다.",
        },
        {
          n: "04",
          title: "기존 도구 연결",
          body: "웹, 앱, 메일, 스프레드시트, 내부 도구 등 실제 사용 환경과 연동합니다.",
        },
        {
          n: "05",
          title: "검수·가드레일",
          body: "잘못된 출력을 걸러내는 확인 단계와 권한 범위를 함께 둡니다.",
        },
        {
          n: "06",
          title: "운영 가이드",
          body: "팀이 직접 운영·개선할 수 있도록 사용 방식과 주의점을 정리합니다.",
        },
      ],
      processTitle: "진행 방식",
      processItems: [
        {
          n: "01",
          title: "업무 파악",
          body: "반복 업무, 채널, 데이터 위치, 품질 기준을 확인합니다.",
        },
        {
          n: "02",
          title: "우선순위 선정",
          body: "효과 대비 구현 난이도가 적절한 자동화부터 고릅니다.",
        },
        {
          n: "03",
          title: "설계",
          body: "프롬프트·규칙·사람 검수 포인트를 포함한 워크플로를 설계합니다.",
        },
        {
          n: "04",
          title: "구축",
          body: "기능과 연동을 구현하고 샘플 데이터로 검증합니다.",
        },
        {
          n: "05",
          title: "파일럿",
          body: "일부 팀·채널에서 먼저 운영하며 품질을 조정합니다.",
        },
        {
          n: "06",
          title: "확장",
          body: "검증된 흐름을 다른 업무 영역으로 넓힙니다.",
        },
      ],
      demoLabel: "DEMO",
      compareTitle: "BEFORE vs AFTER",
      compareLead: "같은 업무가 자동화 전후로 어떻게 달라지는지 한눈에 봅니다.",
      areasTitle: "적용 영역",
      areasLead: "문의·리뷰·문서·운영까지, 반복되는 구간부터 연결합니다.",
      areas: [
        {
          n: "01",
          title: "고객 문의 응대",
          body: "자주 묻는 질문 분류, 초안 답변, 담당자 라우팅.",
        },
        {
          n: "02",
          title: "리뷰·피드백 분석",
          body: "리뷰를 주제별로 묶어 개선 포인트를 정리.",
        },
        {
          n: "03",
          title: "콘텐츠 초안",
          body: "공지, 도움말, 마케팅 초안을 톤에 맞춰 생성.",
        },
        {
          n: "04",
          title: "문서 요약",
          body: "긴 문서·회의록을 의사결정용 요약으로 압축.",
        },
        {
          n: "05",
          title: "사내 지식 검색",
          body: "분산된 문서를 찾아 근거와 함께 답하는 사내 AI.",
        },
        {
          n: "06",
          title: "운영 자동화",
          body: "데이터 정리, 알림, 반복 리포트 생성.",
        },
      ],
      beforeTitle: "Before",
      beforeSteps: [
        "문의·요청이 여러 채널로 들어온다",
        "담당자가 일일이 분류하고 초안을 쓴다",
        "같은 질문에 답변이 달라진다",
        "처리 현황을 나중에야 파악한다",
      ],
      afterTitle: "After",
      afterSteps: [
        "요청이 자동으로 분류된다",
        "초안 답변·요약이 먼저 준비된다",
        "사람은 검수와 예외만 처리한다",
        "처리 결과가 기록으로 남는다",
      ],
      humanTitle: "사람이 남기는 영역",
      humanLead: "AI가 초안을 만들고, 사람은 검수와 예외·책임을 가져갑니다.",
      humanLabel: "STAYS HUMAN",
      statusTitle: "WORKFLOW STATUS",
      humanItems: [
        "최종 판단과 책임",
        "예외·민감 이슈 대응",
        "브랜드 톤 승인",
        "정책·권한 결정",
        "품질 기준 조정",
      ],
      deliverTitle: "전달물",
      deliverItems: [
        "자동화 범위 정의",
        "워크플로 설계",
        "AI 기능 구현물",
        "연동 설정",
        "검수 가이드",
        "운영 문서",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "고객 문의·리뷰 처리량이 늘어난 팀",
        "콘텐츠·문서 작업이 반복되는 조직",
        "AI PoC는 해봤지만 업무에 못 붙인 경우",
        "기존 웹·앱에 AI 기능을 추가하고 싶은 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "어떤 AI 모델을 사용하나요?",
          a: "업무 요구와 데이터 정책에 맞는 구성을 제안합니다. 특정 모델만 전제로 하지 않습니다.",
        },
        {
          q: "우리 데이터가 학습에 쓰이나요?",
          a: "기본은 고객 업무 처리 목적의 연동입니다. 학습·보관 범위는 별도로 합의합니다.",
        },
        {
          q: "완전 자동으로 답장을 보내나요?",
          a: "초기에는 사람 검수를 두는 구성을 권장합니다. 품질이 안정되면 범위를 넓힐 수 있습니다.",
        },
        {
          q: "기존 CRM·메일·시트와 연결되나요?",
          a: "사용 중인 도구를 확인한 뒤 연결 가능한 범위를 안내드립니다.",
        },
        {
          q: "작은 팀도 시작할 수 있나요?",
          a: "가능합니다. 한 가지 반복 업무부터 파일럿으로 시작하는 편이 좋습니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      ctaFinalTitle: "업무에 붙는 AI 자동화부터 시작해보세요.",
      ctaFinalLead: "반복되는 업무와 사용 중인 도구만 알려주셔도 됩니다.",
      ctaFinalBtn: "AI 도입 문의 →",
      scrollProcess: "진행 방식 보기 ↓",
      demoBadge: "DEMO DATA",
    },

    "white-label": {
      seoTitle: "White-label Software | Newon Business",
      metaDescription:
        "검증된 시스템을 고객사 브랜드에 맞게 제공합니다. 예약, CRM, 문의, 대시보드, AI 상담 등 맞춤형 화이트라벨.",
      eyebrow: "WHITE-LABEL",
      subEyebrow: "YOUR BRAND / OUR PRODUCT FOUNDATION",
      headline: "기술은 준비되어 있습니다.\n당신의 브랜드를 더하세요.",
      lead: "기존 제품 구조를 기반으로 브랜드와 요구사항에 맞게 커스터마이징하여 더 빠르게 자체 디지털 제품을 구축합니다.",
      ctaPrimary: "White-label 문의하기 →",
      ctaSecondary: "진행 방식 보기 ↓",
      navLabel: "WHITE-LABEL",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "비슷한 시스템을 또 처음부터 만들고 있다",
          body: "예약·문의·CRM처럼 반복되는 기반은 재사용하고, 브랜드와 차별 기능에 집중합니다.",
        },
        {
          n: "02",
          title: "외주 개발 기간이 너무 길다",
          body: "기반 구조를 활용해 론칭까지의 시간을 줄이고, 필요한 맞춤만 더합니다.",
        },
        {
          n: "03",
          title: "브랜드 경험이 일반 툴처럼 보인다",
          body: "로고만 바꾸는 수준이 아니라 UI, 도메인, 기능 구성을 브랜드에 맞게 맞춥니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "기반 제품 선정",
          body: "목적에 맞는 화이트라벨 베이스와 포함 기능을 정합니다.",
        },
        {
          n: "02",
          title: "브랜드 커스터마이징",
          body: "로고, 컬러, 타이포, UI 톤을 브랜드에 맞게 적용합니다.",
        },
        {
          n: "03",
          title: "기능 구성",
          body: "필요한 모듈만 켜고, 불필요한 흐름은 빼거나 단순화합니다.",
        },
        {
          n: "04",
          title: "도메인·배포",
          body: "고객사 도메인으로 연결하고 운영 환경을 준비합니다.",
        },
        {
          n: "05",
          title: "관리자·권한",
          body: "운영에 필요한 관리 화면과 권한 구조를 맞춥니다.",
        },
        {
          n: "06",
          title: "인수인계",
          body: "운영 방법과 확장 포인트를 정리해 전달합니다.",
        },
      ],
      processTitle: "진행 방식",
      processItems: [
        {
          n: "01",
          title: "요구 확인",
          body: "서비스 목적, 사용자, 필수 기능을 확인합니다.",
        },
        {
          n: "02",
          title: "베이스 매칭",
          body: "적합한 기반 시스템과 커스터마이징 범위를 제안합니다.",
        },
        {
          n: "03",
          title: "브랜드 적용",
          body: "비주얼과 카피를 브랜드에 맞게 입힙니다.",
        },
        {
          n: "04",
          title: "기능 조정",
          body: "추가·제외·연동을 구현합니다.",
        },
        {
          n: "05",
          title: "론칭",
          body: "도메인 연결, 검수, 운영 인수인계를 진행합니다.",
        },
      ],
      demoLabel: "DEMO",
      foundationTitle: "ONE FOUNDATION. YOUR EXPERIENCE.",
      foundationLead: "검증된 기반 위에 브랜드와 필요한 모듈만 올립니다.",
      foundationBaseLabel: "BASE SYSTEM",
      foundationBrandLabel: "YOUR BRAND",
      foundationBaseBody: "공유되는 제품 코어, 검증된 플로우, 관리자·데이터 모델.",
      foundationBrandBody: "아이덴티티, 도메인, 기능 구성, 콘텐츠까지 당신 제품처럼.",
      howTitle: "화이트라벨 방식",
      howLead: "베이스를 고르고, 브랜드를 입히고, 필요한 것만 켜서 출시합니다.",
      how: [
        {
          n: "01",
          title: "Base",
          body: "검증된 핵심 기능 세트를 출발점으로 둡니다.",
        },
        {
          n: "02",
          title: "Brand",
          body: "브랜드 아이덴티티를 UI와 콘텐츠에 반영합니다.",
        },
        {
          n: "03",
          title: "Configure",
          body: "필요한 기능만 구성하고 워크플로를 맞춥니다.",
        },
        {
          n: "04",
          title: "Launch",
          body: "고객사 도메인으로 배포하고 운영을 넘깁니다.",
        },
      ],
      customTitle: "맞춤 가능한 항목",
      customLead: "브랜드·제품·콘텐츠·시스템 네 축으로 맞춥니다.",
      customAreas: [
        { n: "01", title: "BRAND", body: "로고 · 컬러 · 타이포" },
        { n: "02", title: "PRODUCT", body: "예약 · 문의 · CRM 모듈" },
        { n: "03", title: "CONTENT", body: "메뉴 · 정보 구조" },
        { n: "04", title: "SYSTEM", body: "도메인 · 이메일 · 권한" },
      ],
      customItems: [
        "로고 · 컬러 · 타이포",
        "메뉴 · 정보 구조",
        "예약 · 문의 · CRM 모듈",
        "대시보드 지표 구성",
        "AI 상담·자동화 연결",
        "도메인 · 이메일 · 권한",
      ],
      useCaseTitle: "구성 예시",
      configHint: "같은 기반 · 당신 브랜드 화면",
      useCase: {
        base: "Operations Suite",
        brand: "Your Brand",
        color: "#1F1F1F",
        features: ["문의 인박스", "예약", "CRM light", "관리자 대시보드"],
        domain: "app.yourbrand.com",
        status: "READY TO CUSTOMIZE",
      },
      benefitsTitle: "기대할 수 있는 점",
      benefits: [
        "처음부터 모든 기능을 새로 만들지 않아도 됩니다",
        "브랜드 경험을 유지한 채 론칭할 수 있습니다",
        "필요한 모듈만 선택해 복잡도를 낮출 수 있습니다",
        "이후 기능 확장 여지를 남겨둘 수 있습니다",
      ],
      deliverTitle: "전달물",
      deliverItems: [
        "브랜드 적용된 시스템",
        "기능 구성 목록",
        "관리자 환경",
        "도메인 배포",
        "운영 가이드",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "예약·문의·CRM형 서비스가 필요한 브랜드",
        "빠른 론칭이 중요한 팀",
        "완전 커스텀 개발 전에 기반 제품으로 시작하고 싶은 경우",
        "자사 브랜드로 운영 도구를 제공하려는 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "완전 맞춤 개발과 무엇이 다른가요?",
          a: "기반 구조를 재사용해 시작점이 다릅니다. 브랜드와 핵심 차별 기능에  더 집중합니다.",
        },
        {
          q: "소스코드 소유는 어떻게 되나요?",
          a: "계약 범위에 따라 달라집니다. 문의 단계에서 운영·소유 방식을 명확히 안내드립니다.",
        },
        {
          q: "기능 추가는 가능한가요?",
          a: "가능합니다. 베이스에 없는 기능은 별도 범위로 협의합니다.",
        },
        {
          q: "여러 브랜드에 똑같이 쓸 수 있나요?",
          a: "멀티 브랜드 운영이 필요하면 그 구조를 기준으로 설계합니다.",
        },
        {
          q: "AI 기능도 포함되나요?",
          a: "필요하면 AI 상담·자동화 모듈을 연결할 수 있습니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      ctaFinalTitle: "브랜드에 맞는 시스템으로 론칭해보세요.",
      ctaFinalLead: "필요한 기능과 참고 서비스만 알려주셔도 됩니다.",
      ctaFinalBtn: "White-label 문의 →",
      scrollProcess: "진행 방식 보기 ↓",
      demoBadge: "DEMO DATA",
    },

    design: {
      seoTitle: "Design & Branding | Newon Business",
      metaDescription:
        "브랜드부터 UI/UX까지 일관된 경험을 설계합니다. 웹·앱·랜딩·디자인 시스템까지 Newon Design.",
      eyebrow: "DESIGN & BRANDING",
      subEyebrow: "IDENTITY / PRODUCT / EXPERIENCE",
      headline: "보이는 방식과\n사용되는 방식을 설계합니다.",
      lead: "브랜드 아이덴티티부터 웹과 앱의 UI/UX까지 하나의 일관된 제품 경험을 만듭니다.",
      ctaPrimary: "디자인 프로젝트 문의하기 →",
      ctaSecondary: "진행 방식 보기 ↓",
      navLabel: "DESIGN",
      solveTitle: "이런 문제를 해결합니다",
      solveItems: [
        {
          n: "01",
          title: "브랜드와 제품 UI가 따로 논다",
          body: "로고만 있는 상태가 아니라, 제품 화면까지 이어지는 시각 언어를 만듭니다.",
        },
        {
          n: "02",
          title: "화면은 많은데 사용 흐름이 어렵다",
          body: "장식보다 과업 완수를 기준으로 정보 구조와 인터랙션을 다시 잡습니다.",
        },
        {
          n: "03",
          title: "페이지마다 톤이 흔들린다",
          body: "컴포넌트와 규칙을 정해 웹·앱·랜딩이 한 제품처럼 보이게 합니다.",
        },
      ],
      getTitle: "무엇을 받게 되나요",
      getItems: [
        {
          n: "01",
          title: "브랜드 방향",
          body: "톤, 메시지 축, 시각적 분위기를 제품에 맞게 정의합니다.",
        },
        {
          n: "02",
          title: "UI/UX 설계",
          body: "핵심 플로우와 화면을 사용자 과업 중심으로 설계합니다.",
        },
        {
          n: "03",
          title: "디자인 시스템",
          body: "컬러, 타이포, 컴포넌트 규칙을 문서화합니다.",
        },
        {
          n: "04",
          title: "웹·앱 화면 디자인",
          body: "필요한 플랫폼의 주요 화면을 완성도 있게 제작합니다.",
        },
        {
          n: "05",
          title: "랜딩·마케팅 화면",
          body: "제품 소개와 전환을 위한 랜딩 구성을 설계합니다.",
        },
        {
          n: "06",
          title: "개발 전달용 스펙",
          body: "구현에 필요한 간격, 상태, 컴포넌트 기준을 정리합니다.",
        },
      ],
      processTitle: "진행 방식",
      processItems: [
        {
          n: "01",
          title: "발견",
          body: "제품 목표, 사용자, 기존 자산과 제약을 확인합니다.",
        },
        {
          n: "02",
          title: "방향 설정",
          body: "브랜드·UI 톤과 정보 위계의 방향을 합의합니다.",
        },
        {
          n: "03",
          title: "구조와 플로우",
          body: "IA와 핵심 사용 흐름을 먼저 확정합니다.",
        },
        {
          n: "04",
          title: "UI 디자인",
          body: "주요 화면을 고해상도로 완성하고 시스템을 정리합니다.",
        },
        {
          n: "05",
          title: "전달과 핸드오프",
          body: "개발·콘텐츠 팀이 바로 쓸 수 있게 전달합니다.",
        },
      ],
      demoLabel: "DEMO",
      brandGridTitle: "BRAND IS A SYSTEM",
      brandGridLead: "아이덴티티부터 제품 경험까지 한 체계로 연결합니다.",
      brandPillars: [
        { n: "01", title: "IDENTITY", body: "로고·톤·인식이 제품과 이어집니다." },
        { n: "02", title: "PRODUCT", body: "과업을 끝내는 흐름이 먼저입니다." },
        { n: "03", title: "INTERFACE", body: "컴포넌트와 시각 규칙으로 맞춥니다." },
        { n: "04", title: "EXPERIENCE", body: "웹·앱·랜딩이 한 제품처럼 느껴집니다." },
      ],
      servicesTitle: "디자인 범위",
      servicesLead: "브랜드부터 UI/UX, 시스템, 핸드오프까지.",
      services: [
        {
          n: "01",
          title: "Brand Identity",
          body: "로고 활용, 컬러, 타이포, 브랜드 톤.",
        },
        {
          n: "02",
          title: "Product UI/UX",
          body: "웹·앱의 핵심 플로우와 화면 설계.",
        },
        {
          n: "03",
          title: "Design System",
          body: "재사용 가능한 컴포넌트와 규칙.",
        },
        {
          n: "04",
          title: "Landing & Marketing",
          body: "제품·캠페인 소개를 위한 랜딩 구성.",
        },
        {
          n: "05",
          title: "UX Improvement",
          body: "온보딩, 전환, 탐색 등 병목 개선.",
        },
        {
          n: "06",
          title: "Handoff",
          body: "개발 구현을 위한 스펙과 에셋 정리.",
        },
      ],
      systemTitle: "디자인 시스템으로 맞춥니다",
      systemLead: "버튼·인풋·타이포·간격 규칙을 한 라이브러리로 고정합니다.",
      processTitle2: "UI/UX 프로세스",
      process2Lead: "리서치부터 핸드오프까지, 화면만 그리지 않습니다.",
      process2: [
        "Research & goals",
        "IA / user flow",
        "Wireframe",
        "UI design",
        "Prototype review",
        "System & handoff",
      ],
      beforeAfterTitle: "Before / After",
      beforeAfterLead: "위계와 CTA가 정리되면 첫 화면이 달라집니다.",
      beforeLabel: "Before",
      afterLabel: "After",
      beforeNote: "정보 위계가 흐리고 CTA가 경쟁합니다.",
      afterNote: "한 문장과 한 행동이 먼저 읽히도록 정리됩니다.",
      deliverTitle: "전달물",
      deliverItems: [
        "브랜드·톤 가이드",
        "핵심 플로우",
        "UI 화면",
        "디자인 시스템",
        "개발 핸드오프",
      ],
      whoTitle: "이런 팀에 적합합니다",
      whoItems: [
        "제품 출시 전 브랜드와 UI를 함께 잡고 싶은 팀",
        "기존 서비스의 사용성과 톤을 개선하고 싶은 경우",
        "웹·앱·랜딩이 서로 다르게 보이는 경우",
        "개발 전 설계를 탄탄히 하고 싶은 경우",
      ],
      faqTitle: "자주 묻는 질문",
      faqs: [
        {
          q: "로고만 의뢰할 수 있나요?",
          a: "가능하지만, 제품 UI까지 이어질 브랜드 작업을 권장합니다. 범위는 협의로 정합니다.",
        },
        {
          q: "개발도 함께 맡길 수 있나요?",
          a: "가능합니다. Design 이후 Web / App / MVP로 이어갈 수 있습니다.",
        },
        {
          q: "Figma로 전달하나요?",
          a: "일반적으로 편집 가능한 디자인 파일과 핸드오프 기준으로 전달합니다.",
        },
        {
          q: "기존 디자인 개선만 가능한가요?",
          a: "가능합니다. 유지할 자산과 다시 설계할 범위를 나눠 진행합니다.",
        },
        {
          q: "카피라이팅도 포함되나요?",
          a: "구조와 핵심 문장 방향은 함께 잡을 수 있습니다. 최종 브랜드 카피는 협의합니다.",
        },
      ],
      relatedTitle: "관련 서비스",
      exploreAll: "모든 서비스 보기 →",
      priceLabel: "PROJECT COST",
      priceTitle: "프로젝트별 맞춤 견적입니다.",
      timeLead: "브랜드 범위, 화면 수, 플랫폼, 시스템 깊이, 피드백 속도에 따라 기간이 달라질 수 있습니다.",
      timelines: [
        { t: "Focused Design", d: "약 2–3주 · 범위별 상이" },
        { t: "Product Design", d: "약 3–6주 · 범위별 상이" },
        { t: "Full System", d: "별도 협의" },
      ],
      priceName: "DESIGN & BRANDING",
      priceValue: "별도 견적",
      priceFactorsLabel: "가격 결정 요소",
      priceFactors: [
        "Scope — 브랜드·UI·시스템 범위",
        "Platform — Web / App / Both",
        "Screen count — 화면·플로우 수",
        "System depth — 컴포넌트·토큰 범위",
        "Timeline — 일정·리소스",
        "Research — 리서치·테스트 포함",
        "Revision — 피드백·수정 라운드",
        "Handoff — 개발 전달 깊이",
      ],
      priceNote:
        "Scope / Platform / Timeline을 검토한 뒤 견적을 제공합니다. 정찰제 가격은 표시하지 않습니다.",
      useLabel: "USE CASES",
      useTitle: "이런 디자인 프로젝트에 적용됩니다.",
      useBadge: "적용 예시",
      useCases: [
        { t: "PRODUCT LAUNCH", d: "브랜드 방향 → UI 키 화면 → 랜딩 → 개발 핸드오프" },
        { t: "WEB / APP REDESIGN", d: "현 UI 감사 → IA·플로우 → 화면 리디자인 → Design System" },
        { t: "BRAND + PRODUCT", d: "로고·톤 → 제품 UI 언어 → 컴포넌트 라이브러리" },
        { t: "LANDING & CAMPAIGN", d: "메시지 구조 → 전환 UI → 마케팅 화면 세트" },
        { t: "DESIGN SYSTEM", d: "토큰·타입 → 컴포넌트 → 문서화 → 팀 핸드오프" },
      ],
      ctaFinalTitle: "브랜드와 제품이 같은 언어를 쓰게 만드세요.",
      ctaFinalLead: "개선하고 싶은 화면이나 브랜드 현황만 알려주셔도 됩니다.",
      ctaFinalBtn: "디자인 문의 →",
      scrollProcess: "진행 방식 보기 ↓",
      demoBadge: "DESIGN CONCEPT DEMO",
    },
  },

  en: {
    mvp: {
      seoTitle: "MVP Development | Newon Business",
      metaDescription:
        "Turn an idea into a real product you can validate quickly. Planning, UX, build, and release with Newon.",
      eyebrow: "MVP DEVELOPMENT",
      headline: "From idea to\na working product — fast.",
      lead: "We keep only what you need to learn, then ship something people can actually use. You can start at the idea stage.",
      ctaPrimary: "Inquire about MVP",
      ctaSecondary: "See the process ↓",
      navLabel: "MVP",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "You have an idea, but no shape",
          body: "We define the smallest product structure that can test the real question.",
        },
        {
          n: "02",
          title: "Building everything first is risky",
          body: "Extra features delay learning. We ship the core flow first.",
        },
        {
          n: "03",
          title: "Planning, design, and build feel disconnected",
          body: "One continuous path from scope to release — not a handoff chain.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Problem and scope",
          body: "Users, the job to be done, and a clear in/out list for the MVP.",
        },
        {
          n: "02",
          title: "Product structure and UX flow",
          body: "Flows built around completing the task — not random screens.",
        },
        {
          n: "03",
          title: "A working product",
          body: "A web or app MVP you can click, type into, and share.",
        },
        {
          n: "04",
          title: "Essential backend and data",
          body: "Login, save, and read paths needed for real validation.",
        },
        {
          n: "05",
          title: "Deployed environment",
          body: "A release you can show your team or early users.",
        },
        {
          n: "06",
          title: "Next-step roadmap",
          body: "What to expand, what to hold, and what to decide next.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Inquiry",
          body: "Share the idea, audience, timing, and references. A full brief is optional.",
        },
        {
          n: "02",
          title: "Scope",
          body: "We lock what belongs in the MVP — and what does not.",
        },
        {
          n: "03",
          title: "Structure and UX",
          body: "Core flows and screen structure before heavy build.",
        },
        {
          n: "04",
          title: "Build",
          body: "We implement the agreed scope and share progress along the way.",
        },
        {
          n: "05",
          title: "Test and release",
          body: "We check key scenarios, then deploy for validation.",
        },
        {
          n: "06",
          title: "Learn and decide",
          body: "We help you choose keep, expand, or pivot based on early signal.",
        },
      ],
      demoLabel: "DEMO",
      demo: {
        project: { label: "Project", value: "Habit Check MVP" },
        status: { label: "Status", value: "Building" },
        progress: { label: "Progress", value: "Core flow" },
        scope: { label: "Scope", value: "Onboarding · Log · Reminder" },
        current: { label: "Current", value: "Flow polish" },
        next: { label: "Next", value: "Internal release" },
      },
      deliverTitle: "Deliverables",
      deliverItems: [
        "Scope definition",
        "UX flow / screen structure",
        "Working MVP (web or app)",
        "Essential backend and data",
        "Deployed environment",
        "Next-step priorities",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Have an idea but are unsure what to build first",
        "Need market signal quickly as a startup or internal venture",
        "Want a focused first release without feature bloat",
        "Prefer one partner from planning through release",
        "Are stuck with demo-only vendor output",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Can we start without a full plan?",
          a: "Yes. An idea and the problem you want to solve are enough to shape scope together.",
        },
        {
          q: "Web or app — which one?",
          a: "We recommend based on your validation goal and users. We do not build both by default.",
        },
        {
          q: "How long does it take?",
          a: "It depends on scope. After review, we share a realistic timeline sense.",
        },
        {
          q: "Can I get a fixed price on the website?",
          a: "No. Pricing depends on platform and scope. We guide you after reviewing the inquiry.",
        },
        {
          q: "Can we expand after the MVP?",
          a: "Yes. We extend from the flows that already proved useful.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      ctaFinalTitle: "Turn your idea into a product you can validate.",
      ctaFinalLead: "A short note on the service and your current stage is enough.",
      ctaFinalBtn: "Inquire about MVP →",
      scrollProcess: "See the process ↓",
      demoBadge: "DEMO DATA",
      scopeTitle: "You don't need to\nbuild everything first.",
      scopeLead: "Ship only what validates the idea. Everything else waits for signal.",
      scopeItems: [
        { key: "CORE", title: "CORE", body: "Must-have features for first release" },
        { key: "NEXT", title: "NEXT", body: "Add after launch" },
        { key: "LATER", title: "LATER", body: "Decide after validation" },
      ],
      buildGridEyebrow: "CAPABILITY",
      buildGridTitle: "WHAT WE CAN BUILD",
      buildGridLead: "Choose the form that learns fastest — not the platform that looks biggest.",
      buildGridMeta: "06 FORMS",
      buildGrid: [
        {
          tag: "WEB",
          title: "Web MVP",
          body: "A core flow people can use in the browser — signup to value.",
        },
        {
          tag: "APP",
          title: "Mobile App MVP",
          body: "Habits, alerts, and on-the-go use that only make sense on mobile.",
        },
        {
          tag: "OPS",
          title: "Internal Tool",
          body: "Daily ops software for your team — speed and accuracy first.",
        },
        {
          tag: "AI",
          title: "AI Product",
          body: "AI that cuts repeat work. Workflow over model theater.",
        },
        {
          tag: "EXP",
          title: "Prototype",
          body: "A clickable demo for investors and teams — fast and sharp.",
        },
        {
          tag: "GO",
          title: "Landing + Product",
          body: "Persuasion and product entry in one continuous path.",
        },
      ],
    },

    web: {
      seoTitle: "Web Development | Newon Business",
      metaDescription:
        "High-finish websites for brands and services — company sites, landings, and product web with Newon.",
      eyebrow: "WEB DEVELOPMENT",
      headline: "Polished web for\nbrands and services.",
      lead: "Not a template dump of information — a clear brand presence that carries visitors to the next action.",
      ctaPrimary: "Website project inquiry",
      ctaSecondary: "See the process ↓",
      navLabel: "WEB",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "You have a site, but no brand presence",
          body: "We rebuild hierarchy so the brand and offer read in one glance.",
        },
        {
          n: "02",
          title: "Mobile feels broken or hard to scan",
          body: "Responsive structure and typography that stay readable on small screens.",
        },
        {
          n: "03",
          title: "Visitors never reach inquiry",
          body: "We design paths from story to contact, apply, or explore.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Site structure and IA",
          body: "Menus, page roles, and content priority that keep visitors oriented.",
        },
        {
          n: "02",
          title: "Brand-fit UI",
          body: "Type, spacing, and components that feel like your brand — not a theme.",
        },
        {
          n: "03",
          title: "Responsive implementation",
          body: "Layouts that hold up across primary devices.",
        },
        {
          n: "04",
          title: "Core pages",
          body: "Home, about, services, inquiry — whatever the goal requires.",
        },
        {
          n: "05",
          title: "Basic SEO and meta",
          body: "Titles, descriptions, and Open Graph defaults.",
        },
        {
          n: "06",
          title: "Conversion connections",
          body: "Forms and CTAs wired to real next steps.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Define the job",
          body: "Brand story, lead capture, or product explanation — we align on the outcome.",
        },
        {
          n: "02",
          title: "Structure",
          body: "Page map, sections, and content needs.",
        },
        {
          n: "03",
          title: "Design",
          body: "Key screens, visual system, and typography.",
        },
        {
          n: "04",
          title: "Build",
          body: "Responsive implementation with interactions and inquiry flow.",
        },
        {
          n: "05",
          title: "QA and launch",
          body: "Device checks, deploy, and operating notes.",
        },
      ],
      demoLabel: "DEMO",
      typesTitle: "Website types",
      types: [
        {
          n: "01",
          title: "Company / studio site",
          body: "A clear corporate web that explains who you are and how you work.",
        },
        {
          n: "02",
          title: "Brand site",
          body: "World and tone first — when the brand must lead.",
        },
        {
          n: "03",
          title: "Product landing",
          body: "One offer, one story, focused CTAs.",
        },
        {
          n: "04",
          title: "Portfolio / case archive",
          body: "Work and process presented with clarity.",
        },
        {
          n: "05",
          title: "Inquiry / hiring hub",
          body: "Partnership, careers, and conversion-focused hubs.",
        },
      ],
      responsiveTitle: "RESPONSIVE BY DEFAULT",
      responsiveLead: "The same site, reflowed for Desktop · Tablet · Mobile.",
      railTitle: "FROM STRUCTURE TO LAUNCH",
      buildTitle: "What implementation includes",
      buildItems: [
        "Information architecture and navigation",
        "Core page UI",
        "Responsive layout",
        "Form and CTA wiring",
        "Basic SEO / OG",
        "Deploy and domain support",
      ],
      qualityTitle: "BUILT FOR THE REAL WEB",
      quality: [
        {
          title: "Hierarchy",
          body: "Brand and one sentence read first on the opening viewport.",
        },
        {
          title: "Consistency",
          body: "Buttons, sections, and patterns stay stable across pages.",
        },
        {
          title: "Pace",
          body: "Less decoration, faster content.",
        },
        {
          title: "Mobile-first",
          body: "Primary CTA and copy never clip or collapse awkwardly.",
        },
        {
          title: "Operable",
          body: "Structures that allow later copy and image updates.",
        },
      ],
      deliverTitle: "Deliverables",
      deliverItems: [
        "Sitemap / IA",
        "Designed key screens",
        "Responsive web build",
        "Inquiry connections",
        "Basic SEO setup",
        "Deployed environment",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Need an official site that actually shows the brand",
        "Have a landing that under-converts",
        "Need a mobile upgrade for an existing site",
        "Want service and business inquiry in one place",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Do you write copy and provide images?",
          a: "We help with structure and draft direction. Final brand language and assets are aligned with your team.",
        },
        {
          q: "Can you renew an existing site?",
          a: "Yes. We separate what to keep from what to rebuild.",
        },
        {
          q: "Is a CMS included?",
          a: "Only if needed. We scope to how you want to operate the site.",
        },
        {
          q: "Do you support multilingual sites?",
          a: "Yes. Language structure and switching UX are part of the design.",
        },
        {
          q: "What about hosting?",
          a: "We recommend a fit-for-purpose deploy approach and help connect it.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      ctaFinalTitle: "Build a website where the brand reads clearly.",
      ctaFinalLead: "Tell us the site type and what you already have.",
      ctaFinalBtn: "Website project inquiry →",
      scrollProcess: "See the process ↓",
      demoBadge: "DEMO DATA",
    },

    app: {
      seoTitle: "App Development | Newon Business",
      metaDescription:
        "Plan and build iOS and Android apps people can use — including store-ready release support with Newon.",
      eyebrow: "APP DEVELOPMENT",
      headline: "Apps people can use\non iOS and Android.",
      lead: "Not a clickable mock only — a mobile product you can ship to the stores and put in users' hands.",
      ctaPrimary: "App development inquiry",
      ctaSecondary: "See the process ↓",
      navLabel: "APP",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "You know the idea, not the app shape",
          body: "We turn features into a shippable first version with clear flows.",
        },
        {
          n: "02",
          title: "Design and engineering drift apart",
          body: "UX structure and implementation stay aligned for real devices.",
        },
        {
          n: "03",
          title: "Store release feels opaque",
          body: "We carry product work into listing and submission readiness.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Scope and feature definition",
          body: "V1 versus later — a practical roadmap.",
        },
        {
          n: "02",
          title: "Mobile UX / UI",
          body: "Flows and screens designed for touch.",
        },
        {
          n: "03",
          title: "iOS and Android build",
          body: "Implementation matched to the product goal.",
        },
        {
          n: "04",
          title: "API and data wiring",
          body: "Auth, storage, notifications — as needed.",
        },
        {
          n: "05",
          title: "Test builds",
          body: "Internal builds you can run on devices.",
        },
        {
          n: "06",
          title: "Store launch support",
          body: "Listing structure, screenshots, and submission flow help.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Define the product",
          body: "Audience and the core value of version one.",
        },
        {
          n: "02",
          title: "Flows and UI",
          body: "From onboarding to the primary job-to-be-done.",
        },
        {
          n: "03",
          title: "Build",
          body: "App and required backend wiring in the agreed scope.",
        },
        {
          n: "04",
          title: "Test",
          body: "Key scenarios and device checks.",
        },
        {
          n: "05",
          title: "Store submit",
          body: "Listing, build upload, and review.",
        },
        {
          n: "06",
          title: "Improve after launch",
          body: "Plan the next update from early feedback.",
        },
      ],
      demoLabel: "DEMO",
      platformTitle: "Platforms",
      platforms: ["iOS", "Android", "Cross-platform (e.g. Flutter)", "API / Backend"],
      typesTitle: "App types",
      appTypes: [
        "New mobile product",
        "Mobile companion to an existing web service",
        "Internal operations app",
        "Existing app redesign / improvement",
        "Mobile MVP",
      ],
      storeTitle: "Store launch steps",
      storeSteps: [
        "App info and category",
        "Screenshots and preview assets",
        "Privacy and permission copy",
        "Build upload and review",
        "Post-launch versioning",
      ],
      previewScreens: [
        { label: "01", title: "Onboarding" },
        { label: "02", title: "Home" },
        { label: "03", title: "Core Action" },
        { label: "04", title: "Settings" },
      ],
      deliverTitle: "Deliverables",
      deliverItems: [
        "Feature scope",
        "Mobile UX / UI",
        "iOS · Android builds",
        "API · data wiring",
        "Test distribution",
        "Store launch support",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Are launching a service on mobile",
        "Have web today and need an app",
        "Want to improve an existing app's UX or features",
        "Prefer planning through store release with one partner",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Native or cross-platform?",
          a: "We recommend based on goals, timeline, and maintenance — not a stack dogma.",
        },
        {
          q: "Who owns the developer accounts?",
          a: "Usually your organization. We guide setup.",
        },
        {
          q: "Do you build the backend too?",
          a: "When the app needs it. Scope is locked in definition.",
        },
        {
          q: "Is maintenance available after launch?",
          a: "Yes. Update cadence and scope are agreed separately.",
        },
        {
          q: "Can we hire you for design only?",
          a: "Yes — via the Design service for app UI/UX.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      ctaFinalTitle: "Start with an app you can put on the store.",
      ctaFinalLead: "A short description and a reference app are enough to begin.",
      ctaFinalBtn: "App development inquiry →",
      scrollProcess: "See the process ↓",
      demoBadge: "DEMO DATA",
    },

    "ai-automation": {
      seoTitle: "AI Automation | Newon Business",
      metaDescription:
        "Automate repetitive work and support with AI — inquiries, reviews, content, documents, and internal workflows.",
      eyebrow: "AI AUTOMATION",
      headline: "Automate repetitive work\nwith AI that fits the job.",
      lead: "Not a demo chatbot — AI features and workflows attached to how your team already operates.",
      ctaPrimary: "AI automation inquiry",
      ctaSecondary: "See the process ↓",
      navLabel: "AI",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "People repeat the same replies and tasks",
          body: "We automate classification and drafts so humans keep judgment work.",
        },
        {
          n: "02",
          title: "You want AI but not where it should live",
          body: "We map the work and start where automation creates leverage.",
        },
        {
          n: "03",
          title: "Tools pile up; the workflow does not change",
          body: "We design flows that connect to systems and channels you already use.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Automation opportunities",
          body: "Where AI helps — and where humans must stay in the loop.",
        },
        {
          n: "02",
          title: "Workflow design",
          body: "Input → process → review → output, documented.",
        },
        {
          n: "03",
          title: "AI capability build",
          body: "Support, summary, classification, drafting — matched to the job.",
        },
        {
          n: "04",
          title: "Tool connections",
          body: "Web, app, mail, sheets, internal tools — as needed.",
        },
        {
          n: "05",
          title: "Guards and review",
          body: "Checks and permissions that catch bad output.",
        },
        {
          n: "06",
          title: "Operating guide",
          body: "How the team runs and improves the system day to day.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Map the work",
          body: "Repeating tasks, channels, data, and quality bars.",
        },
        {
          n: "02",
          title: "Prioritize",
          body: "Start where impact versus effort is strongest.",
        },
        {
          n: "03",
          title: "Design",
          body: "Rules, prompts, and human review points.",
        },
        {
          n: "04",
          title: "Build",
          body: "Implement and validate with sample work.",
        },
        {
          n: "05",
          title: "Pilot",
          body: "Run with a limited team or channel first.",
        },
        {
          n: "06",
          title: "Expand",
          body: "Widen proven flows to adjacent work.",
        },
      ],
      demoLabel: "DEMO",
      compareTitle: "BEFORE vs AFTER",
      compareLead: "See the same work before and after automation.",
      areasTitle: "Where it applies",
      areasLead: "Start where work repeats — inquiries, reviews, docs, and ops.",
      areas: [
        {
          n: "01",
          title: "Customer inquiries",
          body: "Classify FAQs, draft replies, route owners.",
        },
        {
          n: "02",
          title: "Review and feedback analysis",
          body: "Cluster themes and surface improvement points.",
        },
        {
          n: "03",
          title: "Content drafts",
          body: "Notices, help articles, and marketing drafts on-tone.",
        },
        {
          n: "04",
          title: "Document summary",
          body: "Long docs and notes compressed for decisions.",
        },
        {
          n: "05",
          title: "Internal knowledge search",
          body: "Find answers across scattered documents with sources.",
        },
        {
          n: "06",
          title: "Operations automation",
          body: "Cleanup, alerts, and recurring reports.",
        },
      ],
      beforeTitle: "Before",
      beforeSteps: [
        "Requests arrive across channels",
        "Owners classify and draft by hand",
        "Answers vary for the same question",
        "Status is visible only after the fact",
      ],
      afterTitle: "After",
      afterSteps: [
        "Requests are classified automatically",
        "Draft replies and summaries appear first",
        "Humans handle review and exceptions",
        "Outcomes are recorded as they happen",
      ],
      humanTitle: "What stays human",
      humanLead: "AI drafts the work. People keep review, exceptions, and accountability.",
      humanLabel: "STAYS HUMAN",
      statusTitle: "WORKFLOW STATUS",
      humanItems: [
        "Final judgment and accountability",
        "Sensitive or exception cases",
        "Brand-tone approval",
        "Policy and permission decisions",
        "Quality-bar tuning",
      ],
      deliverTitle: "Deliverables",
      deliverItems: [
        "Automation scope",
        "Workflow design",
        "AI capability build",
        "Integrations",
        "Review guide",
        "Operating docs",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Are drowning in inquiries or reviews",
        "Repeat content and document work",
        "Tried an AI PoC that never reached operations",
        "Want AI features inside an existing web or app",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Which model do you use?",
          a: "We propose a setup that fits the work and data policy — not a single vendor lock-in.",
        },
        {
          q: "Is our data used for training?",
          a: "Default is operational use for your work. Training and retention are agreed separately.",
        },
        {
          q: "Will it send replies fully automatically?",
          a: "We usually start with human review. Automation widens when quality is stable.",
        },
        {
          q: "Can it connect to CRM, mail, or sheets?",
          a: "We review your stack and confirm what we can connect.",
        },
        {
          q: "Can a small team start?",
          a: "Yes. Pilot one repeating workflow first.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      ctaFinalTitle: "Start with AI automation that attaches to real work.",
      ctaFinalLead: "Tell us the repeating work and the tools you already use.",
      ctaFinalBtn: "AI automation inquiry →",
      scrollProcess: "See the process ↓",
      demoBadge: "DEMO DATA",
    },

    "white-label": {
      seoTitle: "White-label Software | Newon Business",
      metaDescription:
        "Ship a proven system under your brand — booking, CRM, inquiry, dashboards, AI support, and more.",
      eyebrow: "WHITE-LABEL",
      headline: "One system.\nYour brand.",
      lead: "Instead of building every foundation from zero, we reshape a proven product structure to your brand, domain, and features.",
      ctaPrimary: "White-label inquiry",
      ctaSecondary: "See the process ↓",
      navLabel: "WHITE-LABEL",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "You keep rebuilding the same foundations",
          body: "Reuse booking, inquiry, and CRM-like cores — spend energy on brand and differentiation.",
        },
        {
          n: "02",
          title: "Custom build timelines are too long",
          body: "Start from a base, then add only the customization you need.",
        },
        {
          n: "03",
          title: "It still feels like a generic tool",
          body: "Beyond a logo swap — UI, domain, and feature set shaped to the brand.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Base selection",
          body: "The white-label foundation and included modules for your goal.",
        },
        {
          n: "02",
          title: "Brand customization",
          body: "Logo, color, type, and UI tone applied to the product.",
        },
        {
          n: "03",
          title: "Feature configuration",
          body: "Enable what you need; remove or simplify the rest.",
        },
        {
          n: "04",
          title: "Domain and deploy",
          body: "Your domain, ready for operations.",
        },
        {
          n: "05",
          title: "Admin and permissions",
          body: "Admin surfaces and access structured for your team.",
        },
        {
          n: "06",
          title: "Handover",
          body: "How to operate and where you can extend next.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Requirements",
          body: "Purpose, users, and must-have features.",
        },
        {
          n: "02",
          title: "Base match",
          body: "Recommend the foundation and customization range.",
        },
        {
          n: "03",
          title: "Brand apply",
          body: "Visual identity and copy tone.",
        },
        {
          n: "04",
          title: "Configure",
          body: "Add, remove, and integrate.",
        },
        {
          n: "05",
          title: "Launch",
          body: "Domain, QA, and operating handover.",
        },
      ],
      demoLabel: "DEMO",
      foundationTitle: "ONE FOUNDATION. YOUR EXPERIENCE.",
      foundationLead: "Start from a proven core, then layer your brand and modules.",
      foundationBaseLabel: "BASE SYSTEM",
      foundationBrandLabel: "YOUR BRAND",
      foundationBaseBody: "Shared product core, proven flows, admin and data model.",
      foundationBrandBody: "Identity, domain, features, and content that feel like yours.",
      howTitle: "How white-label works",
      howLead: "Pick a base, apply the brand, configure what you need, then launch.",
      how: [
        {
          n: "01",
          title: "Base",
          body: "Start from a proven core feature set.",
        },
        {
          n: "02",
          title: "Brand",
          body: "Apply identity across UI and content.",
        },
        {
          n: "03",
          title: "Configure",
          body: "Compose modules and workflows you need.",
        },
        {
          n: "04",
          title: "Launch",
          body: "Deploy on your domain and hand over ops.",
        },
      ],
      customTitle: "What you can customize",
      customLead: "Four axes: brand, product, content, and system.",
      customAreas: [
        { n: "01", title: "BRAND", body: "Logo · color · typography" },
        { n: "02", title: "PRODUCT", body: "Booking · inquiry · CRM modules" },
        { n: "03", title: "CONTENT", body: "Menus · information structure" },
        { n: "04", title: "SYSTEM", body: "Domain · email · permissions" },
      ],
      customItems: [
        "Logo · color · typography",
        "Menus · information structure",
        "Booking · inquiry · CRM modules",
        "Dashboard composition",
        "AI support / automation links",
        "Domain · email · permissions",
      ],
      useCaseTitle: "Example setup",
      configHint: "Same foundation · your brand surface",
      useCase: {
        base: "Operations Suite",
        brand: "Your Brand",
        color: "#1F1F1F",
        features: ["Inquiry inbox", "Booking", "CRM light", "Admin dashboard"],
        domain: "app.yourbrand.com",
        status: "READY TO CUSTOMIZE",
      },
      benefitsTitle: "What to expect",
      benefits: [
        "You do not rebuild every foundation from scratch",
        "You can launch while keeping brand experience",
        "You pick modules and reduce complexity",
        "You leave room to extend later",
      ],
      deliverTitle: "Deliverables",
      deliverItems: [
        "Branded system",
        "Feature configuration list",
        "Admin environment",
        "Domain deploy",
        "Operating guide",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Need booking, inquiry, or CRM-like software under your brand",
        "Care about faster launch",
        "Want a base product before full custom build",
        "Plan to offer an operations tool as your brand",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "How is this different from full custom development?",
          a: "You start from a reusable base. Effort focuses on brand and differentiating features.",
        },
        {
          q: "Who owns the code?",
          a: "It depends on the agreement. We clarify ownership and operations during inquiry.",
        },
        {
          q: "Can we add features later?",
          a: "Yes. Features outside the base are scoped separately.",
        },
        {
          q: "Can multiple brands run on one setup?",
          a: "If you need multi-brand operations, we design for that.",
        },
        {
          q: "Can AI modules be included?",
          a: "Yes — support and automation modules can be connected when needed.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      ctaFinalTitle: "Launch a system that wears your brand.",
      ctaFinalLead: "Share the features you need and a reference product.",
      ctaFinalBtn: "White-label inquiry →",
      scrollProcess: "See the process ↓",
      demoBadge: "DEMO DATA",
    },

    design: {
      seoTitle: "Design & Branding | Newon Business",
      metaDescription:
        "Cohesive brand and UI/UX — web, app, landing, and design systems with Newon Design.",
      eyebrow: "DESIGN & BRANDING",
      headline: "Brand to UI —\none coherent experience.",
      lead: "Not decoration alone — we connect brand language to product UI/UX so every surface speaks the same way.",
      ctaPrimary: "Design inquiry",
      ctaSecondary: "See the process ↓",
      navLabel: "DESIGN",
      solveTitle: "Problems we solve",
      solveItems: [
        {
          n: "01",
          title: "Brand and product UI feel unrelated",
          body: "We extend identity into the product screens users actually touch.",
        },
        {
          n: "02",
          title: "Many screens, hard flows",
          body: "Structure and interaction follow task completion — not ornament.",
        },
        {
          n: "03",
          title: "Tone shifts page to page",
          body: "Components and rules keep web, app, and landing consistent.",
        },
      ],
      getTitle: "What you get",
      getItems: [
        {
          n: "01",
          title: "Brand direction",
          body: "Tone, message axis, and visual atmosphere for the product.",
        },
        {
          n: "02",
          title: "UI/UX design",
          body: "Core flows and screens centered on user jobs.",
        },
        {
          n: "03",
          title: "Design system",
          body: "Color, type, and component rules documented.",
        },
        {
          n: "04",
          title: "Web and app screens",
          body: "High-finish designs for the platforms you need.",
        },
        {
          n: "05",
          title: "Landing and marketing surfaces",
          body: "Layouts that introduce the product and drive action.",
        },
        {
          n: "06",
          title: "Dev-ready specs",
          body: "Spacing, states, and component criteria for implementation.",
        },
      ],
      processTitle: "How we work",
      processItems: [
        {
          n: "01",
          title: "Discover",
          body: "Goals, users, existing assets, and constraints.",
        },
        {
          n: "02",
          title: "Direction",
          body: "Align brand/UI tone and information hierarchy.",
        },
        {
          n: "03",
          title: "Structure and flows",
          body: "IA and critical journeys first.",
        },
        {
          n: "04",
          title: "UI design",
          body: "High-resolution key screens and system rules.",
        },
        {
          n: "05",
          title: "Handoff",
          body: "Deliverables ready for engineering and content.",
        },
      ],
      demoLabel: "DEMO",
      brandGridTitle: "BRAND IS A SYSTEM",
      brandGridLead: "Connect identity to product experience as one system.",
      brandPillars: [
        { n: "01", title: "IDENTITY", body: "Logo, tone, and recognition that carry into product." },
        { n: "02", title: "PRODUCT", body: "Flows that finish the job first." },
        { n: "03", title: "INTERFACE", body: "Components and visual rules that hold." },
        { n: "04", title: "EXPERIENCE", body: "Web, app, and landing feel like one product." },
      ],
      servicesTitle: "Design scope",
      servicesLead: "From brand through UI/UX, system, and handoff.",
      services: [
        {
          n: "01",
          title: "Brand Identity",
          body: "Logo use, color, type, and brand tone.",
        },
        {
          n: "02",
          title: "Product UI/UX",
          body: "Core flows and screens for web and app.",
        },
        {
          n: "03",
          title: "Design System",
          body: "Reusable components and rules.",
        },
        {
          n: "04",
          title: "Landing & Marketing",
          body: "Product and campaign introduction layouts.",
        },
        {
          n: "05",
          title: "UX Improvement",
          body: "Onboarding, conversion, and navigation bottlenecks.",
        },
        {
          n: "06",
          title: "Handoff",
          body: "Specs and assets for implementation.",
        },
      ],
      systemTitle: "Aligned through a design system",
      systemLead: "Buttons, inputs, type, and spacing fixed as one library.",
      processTitle2: "UI/UX process",
      process2Lead: "From research to handoff — not screens alone.",
      process2: [
        "Research & goals",
        "IA / user flow",
        "Wireframe",
        "UI design",
        "Prototype review",
        "System & handoff",
      ],
      beforeAfterTitle: "Before / After",
      beforeAfterLead: "When hierarchy and CTA settle, the first viewport changes.",
      beforeLabel: "Before",
      afterLabel: "After",
      beforeNote: "Hierarchy is soft and CTAs compete.",
      afterNote: "One sentence and one action read first.",
      deliverTitle: "Deliverables",
      deliverItems: [
        "Brand and tone guide",
        "Core flows",
        "UI screens",
        "Design system",
        "Dev handoff",
      ],
      whoTitle: "A good fit if you",
      whoItems: [
        "Want brand and UI set together before launch",
        "Need usability and tone improvements on a live product",
        "Have web, app, and landing that feel inconsistent",
        "Want stronger design before engineering starts",
      ],
      faqTitle: "FAQ",
      faqs: [
        {
          q: "Can you do logo-only work?",
          a: "Yes, though we recommend brand work that continues into product UI. Scope is agreed up front.",
        },
        {
          q: "Can design continue into development?",
          a: "Yes. Design can lead into Web, App, or MVP.",
        },
        {
          q: "Do you deliver in Figma?",
          a: "Typically editable design files plus handoff criteria.",
        },
        {
          q: "Can you improve an existing design only?",
          a: "Yes. We separate what to keep from what to redesign.",
        },
        {
          q: "Is copywriting included?",
          a: "We help with structure and key-line direction. Final brand copy is aligned with your team.",
        },
      ],
      relatedTitle: "RELATED SERVICES",
      exploreAll: "Explore all services →",
      priceLabel: "PROJECT COST",
      priceTitle: "Custom quote per project.",
      timeLead: "Timeline varies with brand scope, screen count, platforms, system depth, and feedback speed.",
      timelines: [
        { t: "Focused Design", d: "About 2–3 weeks · varies by scope" },
        { t: "Product Design", d: "About 3–6 weeks · varies by scope" },
        { t: "Full System", d: "Scoped separately" },
      ],
      priceName: "DESIGN & BRANDING",
      priceValue: "Custom quote",
      priceFactorsLabel: "Pricing factors",
      priceFactors: [
        "Scope — Brand, UI, and system range",
        "Platform — Web / App / Both",
        "Screen count — Screens and flows",
        "System depth — Components and tokens",
        "Timeline — Schedule and resourcing",
        "Research — Research and testing",
        "Revision — Feedback rounds",
        "Handoff — Dev delivery depth",
      ],
      priceNote:
        "Quotes follow review of scope, platform, and timeline. We do not publish fixed list prices.",
      useLabel: "USE CASES",
      useTitle: "Design projects we often take on",
      useBadge: "Examples",
      useCases: [
        { t: "PRODUCT LAUNCH", d: "Brand direction → key UI screens → landing → dev handoff" },
        { t: "WEB / APP REDESIGN", d: "UI audit → IA & flows → screen redesign → design system" },
        { t: "BRAND + PRODUCT", d: "Logo & tone → product UI language → component library" },
        { t: "LANDING & CAMPAIGN", d: "Message structure → conversion UI → marketing surfaces" },
        { t: "DESIGN SYSTEM", d: "Tokens & type → components → docs → team handoff" },
      ],
      ctaFinalTitle: "Make brand and product speak the same language.",
      ctaFinalLead: "Share the screens or brand state you want to improve.",
      ctaFinalBtn: "Design inquiry →",
      scrollProcess: "See the process ↓",
      demoBadge: "DESIGN CONCEPT DEMO",
    },
  },
};

const PRICE_FACTOR_DESC = {
  "data-reporting": {
    ko: {
      "데이터 소스 개수": "연결·수집 대상",
      "데이터 양 및 구조": "볼륨·스키마·정합성",
      "API Integration": "외부·내부 API 연동",
      "데이터 정리 복잡도": "ETL·클린업 깊이",
      "계산 지표 개수": "KPI·파생 지표",
      "자동화 Workflow": "수집·갱신 자동화",
      "Dashboard 필요 여부": "화면·차트 범위",
      "AI 기능": "요약·분류·인사이트",
    },
    en: {
      "Number of data sources": "Connectors and inputs",
      "Data volume and structure": "Volume, schema, quality",
      "API integration": "External and internal APIs",
      "Cleanup complexity": "ETL and normalization depth",
      "Number of metrics": "KPIs and derived fields",
      "Automation workflow": "Collection and refresh jobs",
      "Dashboard need": "Views and chart scope",
      "AI features": "Summaries, classification, insight",
    },
  },
  "internal-tools": {
    ko: {
      "업무 흐름 복잡도": "승인·예외·분기",
      "화면·모듈 수": "기능 단위 범위",
      "역할/권한 구조": "RBAC·접근 제어",
      "데이터 모델": "엔티티·관계 설계",
      "연동 서비스 수": "API·SaaS 연결",
      "자동화 범위": "트리거·액션",
      "AI 기능": "분류·추천·생성",
      "대시보드 필요 여부": "지표·리포트 화면",
    },
    en: {
      "Work-flow complexity": "Approvals, branches, exceptions",
      "Number of screens/modules": "Functional surface area",
      "Role/permission structure": "RBAC and access control",
      "Data model": "Entities and relationships",
      "Number of integrations": "API and SaaS connections",
      "Automation scope": "Triggers and actions",
      "AI features": "Classification and generation",
      "Dashboard needs": "Metrics and report views",
    },
  },
  "workflow-automation": {
    ko: {
      "Workflow 수": "자동화 흐름 개수",
      "Step 수": "단계·액션 수",
      "연결 서비스 수": "SaaS·도구 연동",
      "Trigger 수": "시작 조건",
      "Condition / Branch 수": "분기·조건 로직",
      "API Integration": "커스텀 API",
      "데이터 구조": "필드·매핑",
      "AI 기능": "분류·생성·요약",
    },
    en: {
      "Number of workflows": "Automation flows to build",
      "Number of steps": "Actions per workflow",
      "Connected services": "SaaS and tool links",
      "Number of triggers": "Start conditions",
      "Conditions / branches": "Branching logic",
      "API integration": "Custom API work",
      "Data structure": "Fields and mapping",
      "AI features": "Classification and drafting",
    },
  },
  "market-research": {
    ko: {
      "조사 질문 수": "핵심·부가 질문",
      "시장·카테고리 범위": "지역·세그먼트",
      "경쟁사·플레이어 수": "비교 대상 규모",
      "조사 깊이": "데스크·심층 수준",
      "1차 조사 포함 여부": "인터뷰·설문",
      "자료 접근성·유료 리포트": "소스·구매",
      "산출물 형태·페이지 수": "브리프·맵",
      "긴급 일정": "납기·리소스",
    },
    en: {
      "Number of research questions": "Core and supporting questions",
      "Market or category scope": "Regions and segments",
      "Number of competitors / players": "Comparison set size",
      "Research depth": "Desk vs deep dive",
      "Primary research inclusion": "Interviews and surveys",
      "Source access and paid reports": "Sources and purchases",
      "Deliverable format and length": "Briefs and maps",
      "Urgent timeline": "Deadline and resourcing",
    },
  },
  "competitor-analysis": {
    ko: {
      "경쟁사·대체재 수": "비교 대상",
      "비교 축 수": "기능·가격·메시지",
      "분석 깊이": "표면·심층",
      "기능·UX 비교 포함": "화면·플로우",
      "메시지·콘텐츠 분석": "카피·포지션",
      "산출물 형태": "매트릭스·브리프",
      "긴급 일정": "납기",
    },
    en: {
      "Number of competitors / substitutes": "Comparison set",
      "Number of comparison axes": "Feature, price, message",
      "Analysis depth": "Surface vs deep",
      "Feature / UX compare inclusion": "Screens and flows",
      "Messaging / content analysis": "Copy and positioning",
      "Deliverable format": "Matrix and brief",
      "Urgent timeline": "Deadline",
    },
  },
  "consumer-research": {
    ko: {
      "조사 질문 수": "핵심·부가 질문",
      "대상 사용자·세그먼트 범위": "타깃·페르소나",
      "1차 조사(인터뷰·설문) 포함": "질적·양적",
      "인터뷰·응답 수": "샘플 규모",
      "조사 깊이": "탐색·검증 수준",
      "자료 접근성": "내부·공개 데이터",
      "산출물 형태": "브리프·맵",
      "긴급 일정": "납기",
    },
    en: {
      "Number of research questions": "Core and supporting questions",
      "Target user or segment scope": "Targets and personas",
      "Primary research inclusion": "Qual and quant methods",
      "Interview or response count": "Sample size",
      "Research depth": "Exploratory vs validation",
      "Data accessibility": "Internal and public data",
      "Deliverable format": "Briefs and maps",
      "Urgent timeline": "Deadline",
    },
  },
  "ux-audit": {
    ko: {
      "점검 플로우 수": "핵심·보조 여정",
      "화면·기능 범위": "페이지·모듈",
      "데스크톱·모바일 포함": "반응형 범위",
      "접근 환경(스테이징·계정)": "실제·데모 환경",
      "데이터·CS 연계": "정성·정량",
      "산출물 형태": "리포트·매트릭스",
      "발표·워크숍 포함": "공유·합의",
      "긴급 일정": "납기",
    },
    en: {
      "Number of flows audited": "Core and secondary journeys",
      "Screen and feature range": "Pages and modules",
      "Desktop and mobile inclusion": "Responsive coverage",
      "Environment access (staging, accounts)": "Staging and accounts",
      "Data and support linkage": "Qualitative and quantitative",
      "Deliverable format": "Report and matrix",
      "Presentation or workshop": "Share and alignment",
      "Rush timeline": "Deadline",
    },
  },
  "trend-research": {
    ko: {
      "조사 주제·범위": "테마·시간축",
      "산업·카테고리 수": "적용 영역",
      "시간 범위·깊이": "단기·중장기",
      "경쟁·출시 맥락 포함": "신호 연결",
      "인터뷰·전문가 포함": "1차 소스",
      "산출물 형태": "브리프·맵",
      "모니터링 가이드": "후속 추적",
      "긴급 일정": "납기",
    },
    en: {
      "Research topic and range": "Themes and time horizon",
      "Number of industries or categories": "Coverage areas",
      "Time horizon and depth": "Near vs long term",
      "Competitive and launch context": "Signal linkage",
      "Interviews and experts": "Primary sources",
      "Deliverable format": "Briefs and maps",
      "Monitoring guide": "Follow-up tracking",
      "Rush timeline": "Deadline",
    },
  },
};

function enrichPriceFactors(factors, descMap = {}) {
  return (factors || []).slice(0, 8).map((f) => {
    if (/\s+—\s+/.test(f)) return f;
    const desc = descMap[f];
    return desc ? `${f} — ${desc}` : f;
  });
}

function enrichTimelines(timelines, lang) {
  const suffix = lang === "ko" ? " · 범위별 상이" : " · varies by scope";
  return (timelines || []).map((t, i) => {
    const d = t.d || t.body || "";
    if (i >= 2 || !d) return t;
    if (/별도|custom|Consult|협의|Scoped| · /.test(d)) return t;
    return { ...t, d: `${d}${suffix}` };
  });
}

function normalizeEngagementCopy(c, lang, slug) {
  if (!c) return c;
  const isKo = lang === "ko";
  const defaultTitle = isKo ? "시작가와 기본 범위" : "Starting price and basic scope";
  const priceTitle = c.priceValue ? defaultTitle : c.priceTitle || defaultTitle;
  const descMap = PRICE_FACTOR_DESC[slug]?.[isKo ? "ko" : "en"] || {};
  const flows = USE_CASE_FLOWS[slug]?.[isKo ? "ko" : "en"] || c.useCaseFlows || [];
  return applyServicePricing(
    {
      ...c,
      _pageLang: lang,
      _pageSlug: slug,
      priceTitle,
      priceLabel: c.priceLabel || "PROJECT SCOPE",
      priceFactors: enrichPriceFactors(c.priceFactors, descMap),
      priceFactorsLabel: c.priceFactorsLabel || (isKo ? "기본 범위" : "Basic scope"),
      timeLead: c.timeLead || c.priceLead || "",
      useCaseFlows: flows,
    },
    slug,
    lang
  );
}

function normalizeDataReportingCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "DATA & REPORTING | Newon Business" : "DATA & REPORTING | Newon Business",
    navLabel: "DATA",
    eyebrow: "DATA & REPORTING",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    solveTitle: lang === "ko" ? "이런 문제를 해결합니다" : "Problems we solve",
    solveItems: (c.problems || []).slice(0, 3).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    getTitle: lang === "ko" ? "무엇을 받게 되나요" : "What you get",
    getItems: (c.caps || []).slice(0, 6).map((cap, i) => ({
      n: String(i + 1).padStart(2, "0"),
      title: cap.t,
      body: cap.d,
    })),
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    deliverExtras: c.deliverExtras,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "매주·매월 반복 보고서를 만드는 팀",
          "여러 서비스에 데이터가 흩어져 있는 경우",
          "Spreadsheet 수작업 취합을 줄이고 싶은 경우",
          "핵심 지표를 한곳에서 확인하고 싶은 경우",
        ]
      : [
          "Teams rebuilding weekly or monthly reports",
          "Data scattered across multiple services",
          "Manual spreadsheet collection to cut down",
          "Teams that want key metrics in one place",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeInternalToolsCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: "INTERNAL TOOLS | Newon Business",
    navLabel: "TOOLS",
    eyebrow: "INTERNAL TOOLS",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    solveTitle: isKo ? "이런 문제를 해결합니다" : "Problems we solve",
    solveItems: (c.problems || []).slice(0, 3).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    getTitle: isKo ? "무엇을 받게 되나요" : "What you get",
    getItems: (c.caps || []).slice(0, 6).map((cap, i) => ({
      n: String(i + 1).padStart(2, "0"),
      title: cap.t,
      body: cap.d,
    })),
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    deliverExtras: c.deliverExtras,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "시트·채팅·메일로 운영 업무가 흩어진 팀",
          "승인·상태 관리가 반복되는 경우",
          "기성 SaaS가 프로세스와 맞지 않는 경우",
          "역할별 권한과 이력이 필요한 경우",
        ]
      : [
          "Ops work scattered across sheets, chat, and email",
          "Recurring approvals and status handoffs",
          "Off-the-shelf SaaS that doesn't fit the process",
          "Teams that need roles, permissions, and history",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeWorkflowAutomationCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: c.seoTitle || "Workflow Automation | Newon Business",
    navLabel: "WORKFLOW",
    eyebrow: "02 · WORKFLOW AUTOMATION",
    crumbServices: "SERVICES",
    solveEyebrow: c.whyLabel,
    solveTitle: c.whyTitle,
    solveLead: c.whyLead,
    solveItems: (c.problems || []).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    getEyebrow: "CAPABILITIES",
    getTitle: c.capsTitle || (isKo ? "이런 업무를 자동화할 수 있습니다." : "What we automate"),
    getItems: (c.caps || []).map((cap, i) => ({
      n: String(i + 1).padStart(2, "0"),
      title: cap.t,
      body: cap.d,
    })),
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({ n: p.n, title: p.t, body: p.d })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    deliverExtras: c.deliverExtras,
    finalLabel: "START A PROJECT",
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "여러 SaaS·시트를 수동으로 연결하는 팀",
          "반복 알림·데이터 입력 업무가 많은 팀",
          "누락과 지연이 잦은 운영 프로세스가 있는 경우",
          "기존 도구를 유지하면서 자동화를 확장하고 싶은 경우",
        ]
      : [
          "Teams manually connecting SaaS and spreadsheets",
          "Teams with repetitive alerts and data entry",
          "Ops processes with missed steps or delays",
          "Teams that want automation without replacing tools",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaFinalBtn || c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.automationHubHref || "../",
    ctaSecondaryHref: c.ctaSecondaryHref || "#scope",
    faqTitle: c.faqTitle,
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeMarketResearchCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "MARKET RESEARCH | Newon Business" : "MARKET RESEARCH | Newon Business",
    navLabel: "MARKET",
    eyebrow: "MARKET RESEARCH",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "신규 시장·카테고리 진입을 검토하는 팀",
          "포지셔닝과 차별화 근거가 필요한 제품 팀",
          "투자·파트너 미팅용 시장 요약이 필요한 경우",
          "MVP·로드맵 정의 전 시장 맥락이 필요한 경우",
        ]
      : [
          "Teams evaluating a new market or category",
          "Product teams needing positioning evidence",
          "Founders preparing investor or partner conversations",
          "Teams defining MVP or roadmap scope",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../research/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeCompetitorAnalysisCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "COMPETITOR ANALYSIS | Newon Business" : "COMPETITOR ANALYSIS | Newon Business",
    navLabel: "COMPARE",
    eyebrow: "COMPETITOR ANALYSIS",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "포지셔닝·차별화 근거가 필요한 제품 팀",
          "출시·확장 전 경쟁 환경을 파악하려는 팀",
          "로드맵·MVP 우선순위를 정하려는 팀",
          "투자·파트너 미팅용 경쟁 비교가 필요한 경우",
        ]
      : [
          "Product teams needing positioning evidence",
          "Teams preparing launch or expansion",
          "Teams defining MVP or roadmap priority",
          "Founders needing competitive summary for investors",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../research/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeConsumerResearchCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "CONSUMER RESEARCH | Newon Business" : "CONSUMER RESEARCH | Newon Business",
    navLabel: "CONSUMER",
    eyebrow: "CONSUMER RESEARCH",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "타깃·세그먼트를 검증하려는 제품·마케팅 팀",
          "메시지·포지셔닝 근거가 필요한 팀",
          "기능·서비스 우선순위를 정하려는 팀",
          "출시·리브랜딩 전 사용자 반응을 확인하려는 경우",
        ]
      : [
          "Product and marketing teams validating target segments",
          "Teams needing evidence for messaging and positioning",
          "Teams prioritizing features or service improvements",
          "Teams checking user response before launch or rebrand",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../research/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeUxAuditCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "UX AUDIT | Newon Business" : "UX AUDIT | Newon Business",
    navLabel: "UX",
    eyebrow: "UX AUDIT",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "전환·이탈·사용성 개선이 필요한 제품 팀",
          "리디자인·리뉴얼 전 진단이 필요한 팀",
          "CS·리뷰 피드백을 실행 목록으로 정리하려는 팀",
          "BUILD·DESIGN 우선순위 근거가 필요한 경우",
        ]
      : [
          "Product teams improving conversion, churn, or usability",
          "Teams needing diagnosis before redesign or renewal",
          "Teams turning support and review feedback into a fix list",
          "Teams needing evidence for BUILD or DESIGN priority",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../research/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeTrendResearchCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "TREND RESEARCH | Newon Business" : "TREND RESEARCH | Newon Business",
    navLabel: "TREND",
    eyebrow: "TREND RESEARCH",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "로드맵·콘텐츠·전략 방향을 잡으려는 제품·마케팅 팀",
          "트렌드 정보는 많지만 우선순위가 필요한 팀",
          "신규 사업·분기 계획 전 맥락 정리가 필요한 팀",
          "BUILD·MVP 우선순위 근거가 필요한 경우",
        ]
      : [
          "Product and marketing teams setting roadmap or content direction",
          "Teams with plenty of trend info but no priority",
          "Teams needing context before planning or new business review",
          "Teams needing evidence for BUILD or MVP priority",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../research/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeCustomProductCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "CUSTOM PRODUCT | Newon Business" : "CUSTOM PRODUCT | Newon Business",
    navLabel: "CUSTOM",
    eyebrow: "CUSTOM PRODUCT",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "표준 패키지로 해결되지 않는 요구가 있는 팀",
          "내부 운영·관리용 맞춤 시스템이 필요한 조직",
          "연동·권한·워크플로가 복잡한 제품 구축이 필요한 팀",
          "장기 운영·확장을 전제로 제품을 만들려는 경우",
        ]
      : [
          "Teams whose needs do not fit standard packages",
          "Organizations needing custom internal ops systems",
          "Teams building products with complex integrations and permissions",
          "Teams planning for long-term operation and expansion",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../solutions/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeProductLaunchCopy(c, lang) {
  const isKo = lang === "ko";
  return {
    ...c,
    seoTitle: isKo ? "PRODUCT LAUNCH | Newon Business" : "PRODUCT LAUNCH | Newon Business",
    navLabel: "LAUNCH",
    eyebrow: "PRODUCT LAUNCH",
    crumbBusiness: "BUSINESS",
    crumbServices: "SERVICES",
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo
      ? [
          "아이디어에서 출시까지 한 번에 진행하려는 팀",
          "MVP·랜딩·런치 준비가 분산된 팀",
          "첫 제품·신규 기능·리브랜드 출시를 준비하는 경우",
          "데모·투자·마케팅 일정에 맞춰 출시해야 하는 팀",
        ]
      : [
          "Teams that want idea-to-launch in one engagement",
          "Teams with scattered MVP, landing, and launch prep",
          "Teams preparing first product, feature, or rebrand release",
          "Teams launching on demo, investor, or marketing deadlines",
        ],
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || "../solutions/",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeInternalSystemCopy(c, lang) {
  const isKo = lang === "ko";
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "INTERNAL",
    pillarHref: "../solutions/",
    whoItemsKo: [
      "내부 운영·승인·요청이 엑셀·메신저에 흩어진 조직",
      "부서별로 다른 툴로 운영되는 내부 프로세스가 있는 경우",
      "권한·감사·이력 관리가 필요한 내부 시스템 구축",
      "ERP·CRM·HR 등 기존 시스템과 연동이 필요한 경우",
    ],
    whoItemsEn: [
      "Organizations with internal ops scattered across spreadsheets and chat",
      "Teams running internal processes on different tools by department",
      "Organizations needing role-based access, audit, and history",
      "Teams requiring integration with ERP, CRM, HR, or legacy systems",
    ],
  });
}

function normalizeServiceDetailCopy(c, lang, { navLabel, pillarHref, whoItemsKo, whoItemsEn }) {
  const isKo = lang === "ko";
  return {
    ...c,
    navLabel: navLabel || c.navLabel,
    processTitle: c.processTitle,
    processItems: (c.process || []).map((p) => ({
      n: p.n,
      title: p.t,
      body: p.d,
      examples: p.examples,
    })),
    deliverTitle: c.delTitle,
    deliverLead: c.delLead,
    deliverItems: c.deliverables,
    whoTitle: isKo ? "이런 팀에 적합합니다" : "Who it's for",
    whoItems: isKo ? whoItemsKo || c.whoItems : whoItemsEn || c.whoItems,
    ctaFinalTitle: c.finalTitle,
    ctaFinalLead: c.finalLead,
    ctaFinalBtn: c.ctaPrimary,
    ctaFinalSecondary: c.ctaFinalSecondary,
    ctaFinalSecondaryHref: c.ctaFinalSecondaryHref || pillarHref || "../",
    ctaSecondaryHref: "#workflow",
    relatedTitle: isKo ? "관련 서비스" : "Related services",
    exploreAll: isKo ? "모든 서비스 보기 →" : "Explore all services →",
    prevLabel: isKo ? "이전 서비스" : "Previous service",
    nextLabel: isKo ? "다음 서비스" : "Next service",
  };
}

function normalizeMvpCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "MVP",
    pillarHref: "../build/",
    whoItemsKo: [
      "아이디어는 있지만 무엇부터 만들지 정하지 못한 팀",
      "빠르게 시장·사용자 반응을 확인하고 싶은 스타트업·사내 신사업",
      "과도한 기능 없이 핵심만 출시하고 싶은 경우",
      "기획부터 배포까지 한 파트너와 진행하고 싶은 경우",
    ],
    whoItemsEn: [
      "Teams with an idea but no clear first build scope",
      "Startups or new ventures that need fast market validation",
      "Teams that want to ship core value without feature creep",
      "Teams that want one partner from planning through deploy",
    ],
  });
}

function normalizeWebCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "WEB",
    pillarHref: "../build/",
    whoItemsKo: [
      "브랜드를 제대로 보여주는 공식 웹이 필요한 기업·스튜디오",
      "모바일 경험이 부족한 기존 사이트를 개선하려는 경우",
      "서비스·비즈니스 문의까지 한 사이트에서 받고 싶은 경우",
      "템플릿이 아닌 브랜드에 맞는 웹이 필요한 팀",
    ],
    whoItemsEn: [
      "Companies and studios that need a credible brand website",
      "Teams improving weak mobile experience on an existing site",
      "Teams that want inquiries and conversion on one site",
      "Teams that need a custom site—not a generic template",
    ],
  });
}

function normalizeLandingDetailCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "LANDING",
    pillarHref: "../build/",
    whoItemsKo: [
      "제품·서비스를 곧 출시하는 팀",
      "사전등록·대기열 페이지가 필요한 경우",
      "캠페인·프로모션용 랜딩이 필요한 경우",
      "기존 랜딩의 전환을 개선하고 싶은 경우",
    ],
    whoItemsEn: [
      "Teams launching a product or service soon",
      "Teams needing pre-registration or waitlist pages",
      "Teams running campaign or promo landings",
      "Teams improving conversion on an existing landing",
    ],
  });
}

function normalizeAppCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "APP",
    pillarHref: "../build/",
    whoItemsKo: [
      "투자·내부 공유 전에 앱 흐름을 검증하려는 팀",
      "개발 착수 전 화면·인터랙션을 확인하고 싶은 경우",
      "iOS·Android 핵심 플로우 프로토타입이 필요한 경우",
      "MVP 앱 또는 스토어 출시 준비가 필요한 팀",
    ],
    whoItemsEn: [
      "Teams validating app flows before investor or internal review",
      "Teams confirming screens and interaction before full build",
      "Teams needing iOS/Android core-flow prototypes",
      "Teams preparing MVP apps or store release",
    ],
  });
}

function normalizeAiAutomationCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "AI",
    pillarHref: "../automation/",
    whoItemsKo: [
      "같은 문의·분류·초안 작업을 반복하는 팀",
      "AI를 쓰고 싶지만 어디에 붙일지 모르는 경우",
      "도구만 늘고 워크플로가 바뀌지 않은 조직",
      "Human-in-the-loop 자동화가 필요한 경우",
    ],
    whoItemsEn: [
      "Teams repeating inquiry, classification, and drafting work",
      "Teams that want AI but don't know where to apply it",
      "Organizations with more tools but unchanged workflows",
      "Teams needing human-in-the-loop automation",
    ],
  });
}

function normalizeWhiteLabelCopy(c, lang) {
  return normalizeServiceDetailCopy(c, lang, {
    navLabel: "WHITE-LABEL",
    pillarHref: "../solutions/",
    whoItemsKo: [
      "검증된 제품 기반으로 빠르게 브랜드 제품을 출시하려는 팀",
      "처음부터 전부 새로 만들기엔 시간·비용이 부담되는 경우",
      "브랜드·모듈·도메인을 맞춤 구성해야 하는 경우",
      "운영·관리자 기능까지 포함한 제품이 필요한 경우",
    ],
    whoItemsEn: [
      "Teams launching branded products on a proven foundation",
      "Teams where full custom build is too slow or costly",
      "Teams needing custom brand, modules, and domain setup",
      "Teams that need admin and ops capabilities included",
    ],
  });
}

export function getServiceCopy(slug, lang) {
  const l = lang; // keep full lang so service packs can apply MT overlays
  let copy;
  if (slug === "landing") {
    copy = normalizeLandingDetailCopy(getLandingCopy(l), lang);
  } else if (slug === "mvp") {
    copy = normalizeMvpCopy(getMvpCopy(l), lang);
  } else if (slug === "web") {
    copy = normalizeWebCopy(getWebCopy(l), lang);
  } else if (slug === "app") {
    copy = normalizeAppCopy(getAppCopy(l), lang);
  } else if (slug === "ai-automation") {
    copy = normalizeAiAutomationCopy(getAiAutomationCopy(l), lang);
  } else if (slug === "white-label") {
    copy = normalizeWhiteLabelCopy(getWhiteLabelCopy(l), lang);
  } else if (slug === "data-reporting") {
    copy = normalizeDataReportingCopy(getDataReportingCopy(l), lang);
  } else if (slug === "internal-tools") {
    copy = normalizeInternalToolsCopy(getInternalToolsCopy(l), lang);
  } else if (slug === "workflow-automation") {
    copy = normalizeWorkflowAutomationCopy(getWorkflowAutomationCopy(l), lang);
  } else if (slug === "market-research") {
    copy = normalizeMarketResearchCopy(getMarketResearchCopy(l), lang);
  } else if (slug === "competitor-analysis") {
    copy = normalizeCompetitorAnalysisCopy(getCompetitorAnalysisCopy(l), lang);
  } else if (slug === "consumer-research") {
    copy = normalizeConsumerResearchCopy(getConsumerResearchCopy(l), lang);
  } else if (slug === "ux-audit") {
    copy = normalizeUxAuditCopy(getUxAuditCopy(l), lang);
  } else if (slug === "trend-research") {
    copy = normalizeTrendResearchCopy(getTrendResearchCopy(l), lang);
  } else if (slug === "custom-product") {
    copy = normalizeCustomProductCopy(getCustomProductCopy(l), lang);
  } else if (slug === "product-launch") {
    copy = normalizeProductLaunchCopy(getProductLaunchCopy(l), lang);
  } else if (slug === "internal-system") {
    copy = normalizeInternalSystemCopy(getInternalSystemCopy(l), lang);
  } else {
    const pack = lang === "ko" ? COPY.ko : COPY.en;
    copy = pack[slug] || COPY.en[slug];
  }
  return applyKoSectionLabels(normalizeEngagementCopy(copy, lang, slug), lang);
}

export { COPY };
