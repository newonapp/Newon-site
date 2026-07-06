#!/usr/bin/env node
/** Expand premium feature cards for all app landing pages. Updates locale sources + templates. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");
const SCRIPTS = path.join(ROOT, "scripts");

const CARD = (emoji, title, lead, note) => ({ emoji, title, lead, note });

const PREMIUM_KO = {
  pm: {
    tagline: "복약 관리를 더 안전하고<br />체계적으로",
    cards: [
      CARD("💊", "무제한 약 등록", "개수 제한 없이", "모든 약과 영양제를 등록합니다."),
      CARD("🤖", "AI 복약 인사이트", "복용 패턴·복용률 분석과", "건강 습관 인사이트를 제공합니다."),
      CARD("📅", "월간 복약 캘린더", "월간 복용 현황과", "복용 누락일을 분석합니다."),
      CARD("📦", "스마트 일정 관리", "약 소진 예정·재구매 시점과", "병원 일정을 관리합니다."),
      CARD("👨‍👩‍👧", "가족 공유", "가족 초대·공동 관리와", "보호자 알림을 지원합니다."),
      CARD("🔔", "고급 알림", "반복·에스컬레이션·요일별·", "스누즈로 세밀하게 설정합니다."),
      CARD("☁️", "백업 및 내보내기", "클라우드 백업과 PDF·CSV로", "기록을 안전하게 보관합니다."),
      CARD("🚫", "광고 제거", "배너·전면 광고 없이", "집중할 수 있는 환경을 제공합니다."),
    ],
  },
  sv: {
    tagline: "AI 분석과 데이터 기반<br />소비 관리",
    cards: [
      CARD("🤖", "AI 소비 분석", "소비 패턴 분석, 지출 인사이트 제공,", "절약 포인트를 추천합니다."),
      CARD("💡", "AI 절약 전략", "개인 맞춤 소비 전략, 예산 최적화,", "목표 기반 절약 가이드를 제공합니다."),
      CARD("📊", "고급 통계", "기간별 비교, 지출 예측,", "카테고리 심층 분석을 확인합니다."),
      CARD("🔔", "스마트 알림", "예산 초과 알림, 과소비 경고,", "정기 결제 알림을 제공합니다."),
      CARD("📈", "AI 월간 리포트", "월간 소비 리포트, 소비 변화 분석,", "절약 성과를 확인합니다."),
      CARD("🔗", "공유 기능", "가족, 커플과 공동 예산 공유,", "재무 리포트를 함께 공유합니다."),
      CARD("🎯", "목표 기반 분석", "저축 목표 설정, 소비 목표 달성률,", "절약 현황을 추적합니다."),
      CARD("🚫", "광고 제거", "광고 없이", "집중해서 돈 관리를 할 수 있습니다."),
    ],
  },
  pu: {
    tagline: "절약·챌린지·AI로<br />더 스마트한 저축",
    cards: [
      CARD("🏆", "무제한 챌린지", "개인 절약 챌린지를", "제한 없이 진행할 수 있습니다."),
      CARD("👥", "공동 저축 모임", "친구, 가족, 커플과 함께", "절약 목표를 공유하고 도전할 수 있습니다."),
      CARD("🤖", "AI 절약 코치", "소비 패턴을 분석하고", "맞춤 절약 미션과 개선 방향을 제안합니다."),
      CARD("📊", "고급 통계", "카테고리, 요일, 기간별 소비 패턴을", "더 깊이 분석할 수 있습니다."),
      CARD("🎯", "프리미엄 챌린지", "시즌 챌린지, AI 추천 챌린지,", "그룹 챌린지를 이용할 수 있습니다."),
      CARD("📄", "PDF 리포트 · 백업", "월간 절약 리포트와", "클라우드 백업을 지원합니다."),
      CARD("📲", "홈 위젯", "오늘의 지출, 절약 현황, 목표 달성률을", "앱을 열지 않고 확인할 수 있습니다."),
      CARD("🚫", "광고 제거", "광고 없이", "절약 기록에 집중할 수 있습니다."),
    ],
  },
  bl: {
    tagline: "AI와 데이터로<br />더 똑똑한 육아",
    cards: [
      CARD("👶", "AI 육아 코치", "아이 성장 분석, 발달 인사이트,", "생활 패턴 제안과 맞춤형 육아 가이드를 제공합니다."),
      CARD("🤖", "성장 예측", "성장 추이 분석, 발달 변화 예측,", "연령별 비교 데이터를 제공합니다."),
      CARD("📸", "성장 리포트", "월간 성장 리포트, PDF 아카이브,", "추억 보관과 성장 앨범 테마를 지원합니다."),
      CARD("📅", "학습 분석", "학습 기록, 성취도 분석,", "공부 습관 인사이트를 확인합니다."),
      CARD("📊", "고급 성장 통계", "기간별 성장 비교, 패턴 분석,", "데이터 기반 육아 인사이트를 제공합니다."),
      CARD("🔔", "백업 · 동기화", "기록 안전 보관, 클라우드 백업,", "다중 기기 연동을 지원합니다."),
      CARD("👨‍👩‍👧", "가족 프리미엄 공유", "가족 구성원 초대, 동시 관리,", "공동 육아 환경을 제공합니다."),
      CARD("🚫", "광고 제거", "광고 없이", "아이의 기록에 집중할 수 있습니다."),
    ],
  },
  pl: {
    tagline: "AI와 데이터로<br />더 똑똑한 반려생활",
    cards: [
      CARD("🐾", "AI 건강 코치", "건강 패턴 분석, 행동 분석,", "맞춤 인사이트를 제공합니다."),
      CARD("🤖", "AI 패턴 분석", "생활·활동·건강 변화를", "AI로 깊이 분석합니다."),
      CARD("📸", "무제한 사진 보관", "사진 아카이브, 앨범 생성,", "추억을 안전하게 저장합니다."),
      CARD("📊", "고급 통계", "7일, 30일, 90일,", "연간 데이터 분석을 확인합니다."),
      CARD("🏥", "백업 및 동기화", "클라우드 백업, 다중 기기 동기화,", "안전한 데이터 보관을 지원합니다."),
      CARD("📄", "PDF 리포트", "건강 리포트 생성, 추억 앨범 제작,", "성장 아카이브를 보관합니다."),
      CARD("👨‍👩‍👧", "가족 프리미엄 공유", "보호자 공동 관리, 가족 계정 연동,", "프리미엄 공유를 지원합니다."),
      CARD("🚫", "광고 제거", "광고 없이", "반려동물 기록에 집중하세요."),
    ],
  },
  gu: {
    tagline: "목표·챌린지·AI로<br />더 스마트한 성장",
    cards: [
      CARD("🎯", "무제한 목표", "개수 제한 없이", "원하는 만큼 목표를 설정합니다."),
      CARD("🏆", "무제한 챌린지", "개인·그룹 챌린지를", "제한 없이 진행할 수 있습니다."),
      CARD("🤖", "AI 목표 코치", "성공률 분석, 주간 리포트,", "맞춤 전략을 제공합니다."),
      CARD("📈", "AI 성공 예측", "목표 패턴을 분석하고", "달성 가능성을 예측합니다."),
      CARD("📊", "고급 통계", "요일, 시간, 카테고리별", "성장 패턴 분석과 PDF 리포트를 제공합니다."),
      CARD("⭐", "포커스 목표", "홈 화면 고정, 우선순위 강조,", "집중 모드를 제공합니다."),
      CARD("📲", "홈 위젯", "오늘 목표, D-Day, 연속 기록을", "홈 화면에서 확인합니다."),
      CARD("🚫", "광고 제거", "광고 없이", "목표 달성에 집중하세요."),
    ],
  },
  cu: {
    tagline: "카운터·AI·위젯으로<br />더 깊은 성장 기록",
    cards: [
      CARD("🔢", "무제한 카운터", "5개 제한 없이 모든 행동을", "카운트할 수 있습니다."),
      CARD("📊", "고급 통계", "연간·전체 기간과 시간대·요일", "분석으로 흐름을 파악합니다."),
      CARD("🤖", "AI 코치", "성장 분석·패턴·동기 코칭으로", "꾸준함을 이어갑니다."),
      CARD("📈", "AI 성장 리포트", "주간·월간 자동 리포트로", "변화를 돌아봅니다."),
      CARD("💡", "AI 인사이트", "1개 미리보기가 아닌", "전체 인사이트를 확인합니다."),
      CARD("📲", "홈 위젯", "잠금 오버레이 없이 카운터·", "요약 위젯을 사용합니다."),
      CARD("📅", "Streak·캘린더", "무제한 로그와 연속 기록을", "캘린더에서 확인합니다."),
      CARD("🚫", "광고 제거", "배너·전면 광고 없이", "기록에 집중할 수 있습니다."),
    ],
  },
};

const PREMIUM_EN = {
  pm: {
    tagline: "Safer, more organized<br />medication care",
    cards: [
      CARD("💊", "Unlimited medications", "No count limit—register", "all pills and supplements."),
      CARD("🤖", "AI medication insights", "Pattern and adherence analysis", "with health habit insights."),
      CARD("📅", "Monthly dose calendar", "Full-month view and", "missed-dose analysis."),
      CARD("📦", "Smart schedule management", "Run-out forecasts, refill timing,", "and clinic visits."),
      CARD("👨‍👩‍👧", "Family sharing", "Invite family, manage together,", "with caregiver alerts."),
      CARD("🔔", "Advanced reminders", "Repeat, escalation, weekday,", "and snooze options."),
      CARD("☁️", "Backup & export", "Cloud backup plus PDF/CSV", "to keep records safe."),
      CARD("🚫", "Remove ads", "No banners or full-screen ads—", "a calmer, focused experience."),
    ],
  },
  sv: {
    tagline: "AI analysis & data-driven<br />spending management",
    cards: [
      CARD("🤖", "AI spending analysis", "Pattern analysis and spend insights—", "with savings recommendations."),
      CARD("💡", "AI savings strategy", "Personalized strategies, budget optimization,", "and goal-based savings guides."),
      CARD("📊", "Advanced statistics", "Period comparisons, spend forecasts,", "and deep category views."),
      CARD("🔔", "Smart alerts", "Budget overruns, overspending warnings,", "and recurring payment reminders."),
      CARD("📈", "AI monthly report", "Monthly spend reports, trend analysis,", "and savings progress."),
      CARD("🔗", "Sharing", "Shared budgets for couples and families—", "share financial reports together."),
      CARD("🎯", "Goal-based analysis", "Savings goals, target progress,", "and savings tracking."),
      CARD("🚫", "Remove ads", "No ads—", "focus on managing your money."),
    ],
  },
  pu: {
    tagline: "Savings, challenges & AI<br />for smarter saving",
    cards: [
      CARD("🏆", "Unlimited challenges", "Run personal savings challenges", "with no limits."),
      CARD("👥", "Group saving rooms", "Share savings goals with friends, family, or partners", "and take on challenges together."),
      CARD("🤖", "AI savings coach", "Analyze spending patterns and get", "tailored missions and improvement tips."),
      CARD("📊", "Advanced statistics", "Go deeper on category, weekday, and period patterns", "across your spending data."),
      CARD("🎯", "Premium challenges", "Seasonal, AI-picked, and group", "challenges for extra motivation."),
      CARD("📄", "PDF reports & backup", "Monthly savings reports and", "cloud backup support."),
      CARD("📲", "Home widgets", "Check today's spend, savings status, and goal progress", "without opening the app."),
      CARD("🚫", "Remove ads", "No ads—", "focus on your savings records."),
    ],
  },
  bl: {
    tagline: "Smarter parenting<br />with AI and data",
    cards: [
      CARD("👶", "AI parenting coach", "Growth analysis, development insights,", "routine suggestions, and tailored guides."),
      CARD("🤖", "Growth forecasting", "Trend analysis, development predictions,", "and age-based comparison data."),
      CARD("📸", "Growth reports", "Monthly reports, PDF archives,", "memory keepsakes, and album themes."),
      CARD("📅", "Learning analysis", "Learning logs, achievement tracking,", "and study-habit insights."),
      CARD("📊", "Advanced growth stats", "Period comparisons and pattern analysis—", "data-driven parenting insights."),
      CARD("🔔", "Backup & sync", "Safe record storage, cloud backup,", "and multi-device sync."),
      CARD("👨‍👩‍👧", "Family premium sharing", "Invite family, manage together,", "and share one premium plan."),
      CARD("🚫", "Remove ads", "No ads—", "focus on your child's records."),
    ],
  },
  pl: {
    tagline: "Smarter pet life<br />with AI and data",
    cards: [
      CARD("🐾", "AI health coach", "Health pattern and behavior analysis—", "with tailored insights."),
      CARD("🤖", "AI pattern analysis", "Daily, activity, and health changes—", "analyzed deeply with AI."),
      CARD("📸", "Unlimited photos", "Photo archives, albums,", "and safe memory storage."),
      CARD("📊", "Advanced statistics", "7-, 30-, 90-day,", "and yearly data views."),
      CARD("🏥", "Backup & sync", "Cloud backup, multi-device sync,", "and secure data storage."),
      CARD("📄", "PDF reports", "Health reports, memory albums,", "and growth archives."),
      CARD("👨‍👩‍👧", "Family premium sharing", "Shared caregiver access, family accounts,", "and one premium plan for all."),
      CARD("🚫", "Remove ads", "No ads—", "focus on your pet's records."),
    ],
  },
  gu: {
    tagline: "Goals, challenges & AI<br />for smarter growth",
    cards: [
      CARD("🎯", "Unlimited goals", "No cap—set as many", "goals as you need."),
      CARD("🏆", "Unlimited challenges", "Personal and group challenges", "with no limits."),
      CARD("🤖", "AI goal coach", "Success-rate analysis, weekly reports,", "and tailored strategies."),
      CARD("📈", "AI success forecast", "Analyze goal patterns and", "predict achievement likelihood."),
      CARD("📊", "Advanced statistics", "Weekday, time, and category", "pattern analysis plus PDF reports."),
      CARD("⭐", "Focus goals", "Home pinning, priority emphasis,", "and focus mode."),
      CARD("📲", "Home widgets", "Today's goals, D-day, and streaks", "on your home screen."),
      CARD("🚫", "Remove ads", "No ads—", "focus on achieving your goals."),
    ],
  },
  cu: {
    tagline: "Count · analysis · AI<br />for smarter growth",
    cards: [
      CARD("🔢", "Unlimited counters", "Create as many", "counters as you need."),
      CARD("📊", "Advanced statistics", "Detailed analysis by weekday,", "time, and period."),
      CARD("🤖", "AI growth analysis", "Record patterns and", "growth insights."),
      CARD("📈", "Milestone records", "Achievement history", "saved automatically."),
      CARD("💡", "PDF reports", "Save count data", "as reports."),
      CARD("📲", "Home widgets", "Today's logs and", "streaks on your home screen."),
      CARD("📅", "Cloud backup", "Keep your records", "stored safely."),
      CARD("🚫", "Remove ads", "No ads—", "focus on logging."),
    ],
  },
};

const DATA_FILE_MAP = {
  pm: { file: "pm-data.mjs", ko: "pmKo", en: "pmEn" },
  sv: { file: "savy-data.mjs", ko: "svKo", en: "svEn" },
  pu: { file: "piggyup-data.mjs", ko: "puKo", en: "puEn" },
  bl: { file: "babylog-data.mjs", ko: "blKo", en: "blEn" },
  pl: { file: "petlog-data.mjs", ko: "plKo", en: "plEn" },
  gu: { file: "goalup-data.mjs", ko: "guKo", en: "guEn" },
  cu: { file: "countup-data.mjs", ko: "cuKo", en: "cuEn" },
};

function applyPremiumKeys(sec, data) {
  if (!sec) return;
  sec.premiumTagline = data.tagline;
  data.cards.forEach((c, i) => {
    const n = i + 1;
    sec[`prem${n}Title`] = c.title;
    sec[`prem${n}Lead`] = c.lead;
    sec[`prem${n}Note`] = c.note;
  });
  for (let n = 1; n <= 12; n++) {
    delete sec[`prem${n}P`];
    if (n > data.cards.length) {
      delete sec[`prem${n}Title`];
      delete sec[`prem${n}Lead`];
      delete sec[`prem${n}Note`];
    }
  }
}

function cardHtml(prefix, i, emoji) {
  return `                  <article class="ox-premium-card">
                    <h4 class="ox-premium-card__title">
                      <span class="ox-premium-emoji" aria-hidden="true">${emoji}</span>
                      {{t:${prefix}.prem${i}Title}}
                    </h4>
                    <p class="ox-premium-card__lead">{{t:${prefix}.prem${i}Lead}}</p>
                    <p class="ox-premium-card__note">{{t:${prefix}.prem${i}Note}}</p>
                  </article>`;
}

function replacePremiumGrid(html, prefix, count) {
  const sectionId = `${prefix}-premium`;
  const cards = Array.from({ length: count }, (_, i) =>
    cardHtml(prefix, i + 1, PREMIUM_KO[prefix].cards[i].emoji)
  ).join("\n");
  const re = new RegExp(
    `(id="${sectionId}"[\\s\\S]*?<div class="ox-premium-grid">)[\\s\\S]*?(</div>\\s*</section>)`,
    "m"
  );
  if (!re.test(html)) return html;
  return html.replace(re, `$1\n${cards}\n                $2`);
}

async function patchDataFiles() {
  for (const [appKey, { file, ko: koExport, en: enExport }] of Object.entries(DATA_FILE_MAP)) {
    const mod = await import(path.join(SCRIPTS, file));
    applyPremiumKeys(mod[koExport], PREMIUM_KO[appKey]);
    applyPremiumKeys(mod[enExport], PREMIUM_EN[appKey]);

    let src = fs.readFileSync(path.join(SCRIPTS, file), "utf8");
    for (const [exportName, data] of [
      [koExport, PREMIUM_KO[appKey]],
      [enExport, PREMIUM_EN[appKey]],
    ]) {
      const blockRe = new RegExp(
        `(export const ${exportName} = \\{[\\s\\S]*?)(  premiumTagline:[\\s\\S]*?)(  recoTitle:|  premHiKicker:)`,
        "m"
      );
      const premLines = [
        `  premiumTagline: ${JSON.stringify(data.tagline)},`,
        `  premFeatHeading: ${JSON.stringify(exportName.endsWith("Ko") ? "프리미엄 기능" : exportName === "svEn" ? "Premium features" : exportName.endsWith("En") && appKey === "pl" ? "Premium perks" : "Premium features")},`,
      ];
      data.cards.forEach((c, i) => {
        const n = i + 1;
        premLines.push(`  prem${n}Title: ${JSON.stringify(c.title)},`);
        premLines.push(`  prem${n}Lead: ${JSON.stringify(c.lead)},`);
        premLines.push(`  prem${n}Note: ${JSON.stringify(c.note)},`);
      });
      const replacement = `$1${premLines.join("\n")}\n$3`;
      if (!blockRe.test(src)) {
        console.warn(`skip data block: ${file} ${exportName}`);
        continue;
      }
      src = src.replace(blockRe, replacement);
    }
    fs.writeFileSync(path.join(SCRIPTS, file), src);
    console.log("updated data:", file);
  }
}

function patchKoJson() {
  const koPath = path.join(LOCALES, "ko.json");
  const ko = JSON.parse(fs.readFileSync(koPath, "utf8"));
  for (const [appKey, data] of Object.entries(PREMIUM_KO)) {
    applyPremiumKeys(ko[appKey], data);
  }
  fs.writeFileSync(koPath, JSON.stringify(ko, null, 2) + "\n");
  console.log("updated ko.json premium keys");
}

function patchTemplates() {
  const templateFiles = [
    path.join(ROOT, "templates", "index.html"),
    path.join(ROOT, "templates", "goalup-app-inc.html"),
    path.join(ROOT, "templates", "countup-app-inc.html"),
    path.join(ROOT, "templates", "pillmate-app-inc.html"),
    path.join(ROOT, "templates", "savy-app-inc.html"),
    path.join(ROOT, "templates", "babylog-app-inc.html"),
    path.join(ROOT, "templates", "petlog-app-inc.html"),
    path.join(ROOT, "templates", "piggyup-app-inc.html"),
    path.join(ROOT, "templates", "subping-page.html"),
  ];

  for (const file of templateFiles) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const [prefix, data] of Object.entries(PREMIUM_KO)) {
      const before = html;
      html = replacePremiumGrid(html, prefix, data.cards.length);
      if (html !== before) changed = true;
    }
    if (changed) {
      fs.writeFileSync(file, html);
      console.log("patched template:", path.basename(file));
    }
  }
}

patchKoJson();
await patchDataFiles();
patchTemplates();
console.log("patch-app-premium-cards: OK");
