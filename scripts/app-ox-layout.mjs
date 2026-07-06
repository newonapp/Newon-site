/** Align all app pages with OX MONTH layout patterns. */

export const SP_FEAT_NOTES_KO = {
  1: "Netflix, AI 도구, 통신비까지 한곳에서 확인할 수 있습니다.",
  2: "카테고리별 합계와 이번 달 흐름을 자동으로 정리합니다.",
  3: "무료 체험 종료일과 결제일을 미리 알려드립니다.",
  4: "사용하지 않는 구독을 쉽게 찾아 정리할 수 있습니다.",
  5: "해지 시 절약 가능한 금액을 바로 확인할 수 있습니다.",
  6: "스트리밍, 통신, 생활 등 카테고리별로 나눠 볼 수 있습니다.",
  7: "앱을 열지 않아도 이번 달 지출과 다음 결제를 확인하세요.",
};

export const SP_FEAT_NOTES_EN = {
  1: "Netflix, AI tools, phone bills—everything in one hub.",
  2: "Category totals and this month’s flow, organized for you.",
  3: "Trial end dates and due dates, ahead of time.",
  4: "Find and drop subscriptions you no longer use.",
  5: "See potential savings the moment you cancel.",
  6: "Streaming, phone, living—totals by category.",
  7: "This month’s spend and next payment on your home screen.",
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

export function splitFeatTitle(title) {
  const m = String(title).match(/^(\S+)\s+(.+)$/);
  if (!m) return { emoji: "✨", title: String(title) };
  return { emoji: m[1], title: m[2] };
}

export function migrateSpFeatures(sp, lang) {
  sp.featuresLabel = lang === "ko" ? "앱 기능" : "Features";
  sp.featuresTitle = lang === "ko" ? "주요 기능" : "Key features";
  const notes = lang === "ko" ? SP_FEAT_NOTES_KO : SP_FEAT_NOTES_EN;
  for (let i = 1; i <= 7; i++) {
    const key = `feat${i}Title`;
    if (!sp[key]) continue;
    const { emoji, title } = splitFeatTitle(sp[key]);
    sp[`feat${i}Emoji`] = emoji;
    sp[key] = title;
    if (!sp[`feat${i}Note`]) {
      sp[`feat${i}Note`] = notes[i] || sp[`feat${i}Lead`] || "";
    }
  }
}

export function spFeatureCardHtml(n) {
  return `              <article class="ox-feature-card">
                <span class="ox-feature-emoji" aria-hidden="true">{{t:sp.feat${n}Emoji}}</span>
                <h3>{{t:sp.feat${n}Title}}</h3>
                <p class="ox-feature-lead">{{t:sp.feat${n}Lead}}</p>
                <p class="ox-feature-note">{{t:sp.feat${n}Note}}</p>
              </article>`;
}

export const SP_FEATURES_SECTION = `<section id="sp-features" class="ox-section ox-reveal-on-scroll" aria-labelledby="sp-features-title">
          <div class="ox-container">
            <header class="ox-section-head">
              <p class="ox-section-label">{{t:sp.featuresLabel}}</p>
              <h2 id="sp-features-title" class="ox-section-title-inline">
                <span class="ox-section-title-inline__icon" aria-hidden="true">🚀</span>
                {{t:sp.featuresTitle}}
              </h2>
            </header>
            <div class="ox-features">
${[1, 2, 3, 4, 5, 6, 7].map(spFeatureCardHtml).join("\n")}
            </div>
          </div>
        </section>`;
