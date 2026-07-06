/** User review stories — placed above main features on each app page. */

export const REVIEWS_LABEL = {
  ko: "후기",
  en: "Reviews",
};

export const REVIEWS_TITLE = {
  ko: "사용자 이야기",
  en: "User stories",
};

/** @type {{ ns: string; reviews: { emoji: string; ko: { quote: string; meta: string }; en: { quote: string; meta: string } }[] }[]} */
export const REVIEW_APPS = [
  {
    ns: "ox",
    reviews: [
      {
        emoji: "👩🏻",
        ko: { quote: "체크 하나 했을 뿐인데 어느새 100일째 운동을 이어가고 있었어요.", meta: "간호학과 학생 · 21세" },
        en: { quote: "One check at a time—and before I knew it, I was on day 100 of working out.", meta: "Nursing student · 21" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "거창한 계획보다 매일 O 하나가 훨씬 강력했습니다.", meta: "경찰 준비생 · 26세" },
        en: { quote: "A daily O beat any grand plan I ever made.", meta: "Police exam prep · 26" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "습관은 의지가 아니라 시스템이라는 걸 처음 느꼈어요.", meta: "초등교사 · 31세" },
        en: { quote: "I finally felt that habits are about systems, not willpower.", meta: "Elementary teacher · 31" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "작심삼일을 반복하던 제가 처음으로 루틴을 만들었습니다.", meta: "개발자 · 34세" },
        en: { quote: "After years of three-day resolutions, I finally built a real routine.", meta: "Developer · 34" },
      },
    ],
  },
  {
    ns: "gu",
    reviews: [
      {
        emoji: "👨🏻",
        ko: { quote: "목표를 세우는 사람이 아니라 목표를 달성하는 사람이 된 것 같아요.", meta: "스타트업 대표 · 34세" },
        en: { quote: "I feel like someone who finishes goals—not just sets them.", meta: "Startup founder · 34" },
      },
      {
        emoji: "👩🏻",
        ko: { quote: "작은 성공이 쌓이니까 자신감도 같이 커졌어요.", meta: "대학생 · 22세" },
        en: { quote: "Small wins stacked up—and so did my confidence.", meta: "College student · 22" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "포기하던 목표들을 끝까지 해내게 되었습니다.", meta: "마케터 · 28세" },
        en: { quote: "Goals I used to drop—I actually see through now.", meta: "Marketer · 28" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "성장 과정을 눈으로 볼 수 있다는 게 가장 좋습니다.", meta: "연구원 · 38세" },
        en: { quote: "The best part is seeing my growth in plain sight.", meta: "Researcher · 38" },
      },
    ],
  },
  {
    ns: "cu",
    reviews: [
      {
        emoji: "👩🏼",
        ko: { quote: "공부 시간, 독서량, 운동 횟수까지 모두 기록하고 있어요.", meta: "의대생 · 24세" },
        en: { quote: "Study hours, books read, workouts—I track it all.", meta: "Med student · 24" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "기억은 사라지지만 기록은 남더라고요.", meta: "사진작가 · 32세" },
        en: { quote: "Memory fades, but the log stays.", meta: "Photographer · 32" },
      },
      {
        emoji: "👩🏻",
        ko: { quote: "몇 달 전의 나와 지금의 나를 비교하는 재미가 생겼어요.", meta: "콘텐츠 크리에이터 · 26세" },
        en: { quote: "It's fun comparing me from months ago to me today.", meta: "Content creator · 26" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "작은 숫자가 쌓여서 큰 변화를 만든다는 걸 느끼게 됩니다.", meta: "건축사 · 41세" },
        en: { quote: "Small numbers add up—and you feel the bigger shift.", meta: "Architect · 41" },
      },
    ],
  },
  {
    ns: "pu",
    reviews: [
      {
        emoji: "👩🏻",
        ko: { quote: "절약을 게임처럼 만들었다는 게 정말 재밌어요.", meta: "대학생 · 22세" },
        en: { quote: "Turning saving into a game is genuinely fun.", meta: "College student · 22" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "돈을 안 쓰는 게 아니라 더 현명하게 쓰게 됐습니다.", meta: "직장인 · 30세" },
        en: { quote: "I'm not spending less—I'm spending smarter.", meta: "Office worker · 30" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "작은 소비 습관들이 하나씩 바뀌기 시작했어요.", meta: "승무원 · 29세" },
        en: { quote: "Little spending habits started changing one by one.", meta: "Flight attendant · 29" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "절약이 스트레스가 아니라 성취처럼 느껴집니다.", meta: "자영업자 · 39세" },
        en: { quote: "Saving feels like a win—not a strain.", meta: "Small business owner · 39" },
      },
    ],
  },
  {
    ns: "sv",
    reviews: [
      {
        emoji: "👩🏻",
        ko: { quote: "왜 항상 돈이 부족했는지 처음으로 이해하게 됐어요.", meta: "대학원생 · 25세" },
        en: { quote: "I finally understood why money always felt tight.", meta: "Grad student · 25" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "AI가 소비 습관을 분석해주는 게 생각보다 정확합니다.", meta: "회계사 · 35세" },
        en: { quote: "The AI read my spending habits more accurately than I expected.", meta: "Accountant · 35" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "지출을 기록하는 게 아니라 소비 성향을 배우는 느낌이에요.", meta: "UX 디자이너 · 28세" },
        en: { quote: "It feels like learning my spending style—not just logging expenses.", meta: "UX designer · 28" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "가계부를 처음으로 3개월 넘게 쓰고 있습니다.", meta: "IT 기획자 · 40세" },
        en: { quote: "First time I've kept a budget past three months.", meta: "IT planner · 40" },
      },
    ],
  },
  {
    ns: "sp",
    reviews: [
      {
        emoji: "👨🏻",
        ko: { quote: "매달 자동 결제되는 돈이 이렇게 많았다는 게 충격이었어요.", meta: "개발자 · 31세" },
        en: { quote: "I was shocked how much was auto-charging every month.", meta: "Developer · 31" },
      },
      {
        emoji: "👩🏻",
        ko: { quote: "안 쓰는 구독만 정리했는데 커피값이 생겼습니다.", meta: "대학생 · 23세" },
        en: { quote: "I dropped unused subs and suddenly had coffee money.", meta: "College student · 23" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "넷플릭스부터 AI 구독까지 한 번에 관리할 수 있어 편해요.", meta: "영상 편집자 · 27세" },
        en: { quote: "Netflix to AI tools—managing everything in one place is easy.", meta: "Video editor · 27" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "구독 서비스가 많아질수록 필수 앱이 되는 것 같아요.", meta: "프리랜서 · 37세" },
        en: { quote: "The more subscriptions I have, the more essential this app feels.", meta: "Freelancer · 37" },
      },
    ],
  },
  {
    ns: "pm",
    reviews: [
      {
        emoji: "👩🏼",
        ko: { quote: "약 먹는 걸 잊어버리는 일이 거의 없어졌어요.", meta: "간호사 · 29세" },
        en: { quote: "I almost never forget my meds anymore.", meta: "Nurse · 29" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "부모님 건강 관리도 함께 할 수 있어서 좋습니다.", meta: "직장인 · 35세" },
        en: { quote: "I can help manage my parents' health too—that's a big plus.", meta: "Office worker · 35" },
      },
      {
        emoji: "👩🏻",
        ko: { quote: "건강도 결국은 꾸준함이라는 걸 느끼게 됐어요.", meta: "필라테스 강사 · 32세" },
        en: { quote: "Health really comes down to showing up every day.", meta: "Pilates instructor · 32" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "영양제를 챙겨 먹는 습관이 자연스럽게 생겼습니다.", meta: "운동 코치 · 42세" },
        en: { quote: "Taking supplements became a natural habit.", meta: "Fitness coach · 42" },
      },
    ],
  },
  {
    ns: "bl",
    reviews: [
      {
        emoji: "👩🏻",
        ko: { quote: "사진만 남는 줄 알았는데 그날의 감정까지 기억하게 되네요.", meta: "엄마 · 31세" },
        en: { quote: "I thought I'd only keep photos—but I remember how each day felt.", meta: "Mom · 31" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "아이의 첫 순간들을 놓치지 않게 됐어요.", meta: "아빠 · 36세" },
        en: { quote: "I don't miss my child's first moments anymore.", meta: "Dad · 36" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "몇 년 뒤 아이와 함께 볼 생각을 하면 벌써 설렙니다.", meta: "엄마 · 29세" },
        en: { quote: "Thinking about watching these with my kid years from now already excites me.", meta: "Mom · 29" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "육아 기록이 쌓일수록 가족 앨범이 만들어지는 기분이에요.", meta: "아빠 · 38세" },
        en: { quote: "As logs pile up, it feels like our family album is building itself.", meta: "Dad · 38" },
      },
    ],
  },
  {
    ns: "pl",
    reviews: [
      {
        emoji: "👩🏻",
        ko: { quote: "반려동물의 하루를 기록하는 게 작은 추억 상자 같아요.", meta: "일러스트레이터 · 27세" },
        en: { quote: "Logging my pet's day feels like a little memory box.", meta: "Illustrator · 27" },
      },
      {
        emoji: "👨🏻",
        ko: { quote: "병원 기록부터 산책까지 모두 한곳에 모여 있어서 편합니다.", meta: "보호자 · 34세" },
        en: { quote: "Vet visits to walks—everything in one place is so handy.", meta: "Pet parent · 34" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "우리 아이와 보낸 시간을 더 오래 기억할 수 있게 됐어요.", meta: "사진작가 · 30세" },
        en: { quote: "I can hold on to time with our fur baby longer.", meta: "Photographer · 30" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "반려동물의 성장 과정이 한 권의 일기처럼 남습니다.", meta: "카페 운영자 · 41세" },
        en: { quote: "My pet's growth reads like a diary volume by volume.", meta: "Café owner · 41" },
      },
    ],
  },
  {
    ns: "np",
    reviews: [
      {
        emoji: "👨🏻",
        ko: { quote: "예전엔 앱마다 따로 관리했는데 이제는 Newon 하나로 끝나요.", meta: "PM · 33세" },
        en: { quote: "I used to juggle apps—now Newon is the one stop.", meta: "PM · 33" },
      },
      {
        emoji: "👩🏻",
        ko: { quote: "습관, 목표, 소비까지 제 일상이 하나로 연결되는 느낌입니다.", meta: "대학생 · 22세" },
        en: { quote: "Habits, goals, spending—my daily life feels connected in one place.", meta: "College student · 22" },
      },
      {
        emoji: "👩🏼",
        ko: { quote: "하나의 구독으로 여러 앱을 이용하는 게 정말 편리해요.", meta: "콘텐츠 에디터 · 29세" },
        en: { quote: "One subscription for many apps is genuinely convenient.", meta: "Content editor · 29" },
      },
      {
        emoji: "👨🏽",
        ko: { quote: "Apple One 같은 경험을 생산성 앱에서도 느끼게 될 줄 몰랐어요.", meta: "창업가 · 40세" },
        en: { quote: "I didn't expect an Apple One–like feel from productivity apps.", meta: "Entrepreneur · 40" },
      },
    ],
  },
];

export const DATA_FILE_BY_NS = {
  pm: "pm-data.mjs",
  sv: "savy-data.mjs",
  bl: "babylog-data.mjs",
  pl: "petlog-data.mjs",
  pu: "piggyup-data.mjs",
  gu: "goalup-data.mjs",
  cu: "countup-data.mjs",
  np: "newon-plus-data.mjs",
};

export const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

const AVATAR_VARIANTS = ["a", "b", "c", "d"];

export function reviewKeysForLang(lang, app) {
  const l = lang === "ko" ? "ko" : "en";
  const keys = {
    reviewsLabel: REVIEWS_LABEL[l],
    reviewsTitle: REVIEWS_TITLE[l],
  };
  app.reviews.forEach((r, i) => {
    const n = i + 1;
    keys[`review${n}Emoji`] = r.emoji;
    keys[`review${n}Quote`] = r[l].quote;
    keys[`review${n}Meta`] = r[l].meta;
  });
  return keys;
}

export function reviewsSectionHtml(ns) {
  const cards = AVATAR_VARIANTS.map((v, i) => {
    const n = i + 1;
    return `              <article class="ox-review-card">
                <div class="ox-review-avatar ox-review-avatar--${v}" aria-hidden="true">{{t:${ns}.review${n}Emoji}}</div>
                <blockquote class="ox-review-quote">
                  <p>&ldquo;{{t:${ns}.review${n}Quote}}&rdquo;</p>
                </blockquote>
                <footer class="ox-review-meta">&mdash; {{t:${ns}.review${n}Meta}}</footer>
              </article>`;
  }).join("\n");

  return `<section id="${ns}-reviews" class="ox-section ox-reviews ox-reveal-on-scroll" aria-labelledby="${ns}-reviews-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">{{t:${ns}.reviewsLabel}}</p>
              <h2 id="${ns}-reviews-title" class="ox-section-title-inline">
                <span class="ox-section-title-inline__icon" aria-hidden="true">💬</span>
                {{t:${ns}.reviewsTitle}}
              </h2>
            </header>
            <div class="ox-reviews-grid">
${cards}
            </div>
          </div>
        </section>`;
}
