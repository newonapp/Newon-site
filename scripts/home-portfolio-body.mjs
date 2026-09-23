/**
 * Homepage below the hero, in the portfolio layout.
 * Copy stays the current homepage copy. Hero is not built here.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getStoryCopy } from "./home-biz-copy.mjs";
import { getCompanyStoryCopy } from "./home-company-copy.mjs";
import { getCompanyProjects } from "./company-portfolio-data.mjs";
import { NAV_FLYOUT_SLUGS } from "./portfolio-data.mjs";
import { getAppsFilmCopy } from "./apps-showcase-render.mjs";
import { getAiFilmCopy } from "./ai-film-hero.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";
import { getOngilCopy } from "./home-ongil-copy.mjs";
import { getBusinessFilmCopy } from "./business-film-copy.mjs";
import { getEcosystemCopy } from "./ecosystem-copy.mjs";

const FILM = {
  consumer:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_153826_e9005cf7-a1c7-4c7d-886f-fea22d644a9c.mp4",
  ai: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4",
  lifestage:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_102608_5fa1187d-9ac6-44fb-82ab-54376200abc0.mp4",
  ongil:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260323_071151_38c3924f-c312-48af-a196-3fbb80e4226f.mp4",
  business:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4",
  commerce:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4",
  games:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_230900_ef8565a6-16eb-4fe9-98e4-4b972d3f436d.mp4",
};

function href(lang, path) {
  if (!path || path.startsWith("#") || path.startsWith("/") || /^https?:/.test(path)) return path;
  return `/${lang}/${path.replace(/^\.\//, "")}`;
}

function br(text) {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

function plain(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function filmLockup(id, lang) {
  const apps = getAppsFilmCopy(lang);
  const ai = getAiFilmCopy("personal", lang);
  const life = getLifeStageCopy(lang);
  const ongil = getOngilCopy(lang);
  const business = getBusinessFilmCopy(lang);
  const eco = getEcosystemCopy(lang);
  const gamesSlogan =
    lang === "ko"
      ? "AI만 남은 세상에서<br>마지막 인간임을 숨기세요."
      : "In a world of AI,<br>hide that you are the last human.";
  const map = {
    consumer: { wordmark: "Newon<br>App", slogan: apps.sloganHtml },
    ai: { wordmark: "Newon AI", slogan: ai.sloganHtml },
    lifestage: { wordmark: "LivOn", slogan: life.hero.titleHtml },
    ongil: { wordmark: "Ongil", slogan: ongil.hero.titleHtml },
    business: { wordmark: "Newon Business", slogan: business.sloganHtml },
    commerce: { wordmark: "Newon<br>Ecosystem", slogan: eco.sloganHtml },
    games: { wordmark: "404:<br>HUMAN", slogan: gamesSlogan },
  };
  return map[id] || { wordmark: "", slogan: "" };
}

function filmPlate(src, lockup) {
  const label = `${plain(lockup.wordmark)} ${plain(lockup.slogan)}`.trim();
  return `<div class="np-film">
    <video muted loop autoplay playsinline webkit-playsinline preload="auto" disablepictureinpicture src="${escapeHtml(src)}" aria-label="${escapeHtml(label)}"></video>
    <div class="np-film__lockup">
      <div class="np-film__veil" aria-hidden="true"></div>
      <p class="np-film__wordmark">${lockup.wordmark}</p>
      <p class="np-film__slogan">${lockup.slogan}</p>
    </div>
  </div>`;
}

function marquee(stories, logos, label, lang) {
  const films = stories
    .map((story) => {
      const plate = `<div class="np-marquee__film">${filmPlate(FILM[story.id], filmLockup(story.id, lang))}</div>`;
      return plate;
    })
    .join("");
  const marks = logos
    .map(
      (logo) => `<div class="np-marquee__logo"><img src="${escapeHtml(logo.icon)}" alt="${escapeHtml(logo.name)}" width="64" height="64" loading="lazy" /></div>`
    )
    .join("");
  return `<section class="np-marquee" aria-label="${escapeHtml(label)}">
    <p class="np-kicker">${escapeHtml(label)}</p>
    <div class="np-marquee__row"><div class="np-marquee__track" data-dir="1">${films}${films}</div></div>
    <div class="np-marquee__row"><div class="np-marquee__track" data-dir="-1">${marks}${marks}${marks}</div></div>
  </section>`;
}

export function buildPortfolioHomeBody(lang) {
  const L = lang || "en";
  const story = getStoryCopy(L);
  const company = getCompanyStoryCopy(L);
  const meaning = company.meaning;
  const vision = company.vision;
  const eco = company.eco;
  const about = company.about;
  const biz = story.eco;
  const projects = getCompanyProjects(L === "ko" ? "ko" : "en");
  const bySlug = Object.fromEntries(projects.map((item) => [item.slug, item]));
  const logos = NAV_FLYOUT_SLUGS.filter((slug) => slug !== "eaton" && slug !== "fiton")
    .map((slug) => bySlug[slug])
    .filter((item) => item && item.icon);

  const defs = [
    [meaning.newLabel, meaning.newTitle, meaning.newBody, "-72"],
    [meaning.onLabel, meaning.onTitle, meaning.onBody, "72"],
  ]
    .map(
      ([label, title, body, shift]) => `<article class="np-def" data-np-x="${shift}">
        <p class="np-kicker">${escapeHtml(label)}</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
      </article>`
    )
    .join(`<p class="np-plus" data-np-x="0" aria-hidden="true">+</p>`);

  const services = story.stories
    .map(
      (item) => `<li class="np-row np-reveal">
        <a href="#story-${escapeHtml(item.id)}">
          <span class="np-row__n">${escapeHtml(item.n)}</span>
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            <em>${escapeHtml(story.statusLabels[item.status] || "")}</em>
            <p>${escapeHtml(item.lead)}</p>
          </span>
        </a>
      </li>`
    )
    .join("");

  const pillars = vision.pillars
    .map(
      (item, index) => `<li class="np-pillar" data-np-x="0" data-np-delay="${(index * 0.16).toFixed(2)}">
        <span class="np-num">${escapeHtml(item.n)}</span>
        <span class="np-en">${escapeHtml(item.en)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </li>`
    )
    .join("");

  const cards = story.stories
    .map((item, index) => {
      const total = story.stories.length;
      const next = item.next
        ? `<p class="np-card__next">${escapeHtml(story.nextLabel)} · ${escapeHtml(item.next)}</p>`
        : "";
      const keys = (item.keys || []).map((key) => `<li>${escapeHtml(key)}</li>`).join("");
      return `<div class="np-pin">
        <article class="np-card" id="story-${escapeHtml(item.id)}" style="--np-i:${index};--np-n:${total}">
          <header class="np-card__head">
            <span class="np-card__n">${escapeHtml(item.n)}</span>
            <div>
              <p class="np-kicker">${escapeHtml(item.cat)}</p>
              <h3>${escapeHtml(item.name)}</h3>
            </div>
            <a class="np-pill" href="${escapeHtml(href(L, item.ctaHref))}">${escapeHtml(item.cta)}</a>
          </header>
          <p class="np-card__lead">${escapeHtml(item.lead)}</p>
          ${filmPlate(FILM[item.id], filmLockup(item.id, L))}
          <ul class="np-keys">${keys}</ul>
          <p class="np-card__status">${escapeHtml(story.statusLabels[item.status] || "")}</p>
          ${next}
        </article>
      </div>`;
    })
    .join("");

  const names = eco.names.map((name) => `<li>${escapeHtml(name)}</li>`).join("");

  return `<div class="np-home">
${marquee(story.stories, logos, biz.kicker, L)}
<section id="hc-meaning" class="np-about" aria-labelledby="hc-meaning-title">
  <p class="np-kicker">${escapeHtml(meaning.kicker)}</p>
  <h2 id="hc-meaning-title" class="np-display">${escapeHtml(meaning.wordmark)}</h2>
  <p class="np-about__slogan">${escapeHtml(meaning.slogan)}</p>
  <p class="np-about__body" data-np-chars>${escapeHtml(meaning.intro)}</p>
  <div class="np-defs">${defs}</div>
  <p class="np-eq" data-np-x="0">${escapeHtml(meaning.closeEq)}</p>
  <p class="np-close-line" data-np-x="0">${br(meaning.closeLead)}</p>
</section>
<section class="np-services" id="hc-services" aria-labelledby="np-services-title">
  <h2 id="np-services-title" class="np-display">${br(biz.titleHtml.replace(/<br\s*\/?>/gi, "\n"))}</h2>
  <p class="np-lead">${escapeHtml(biz.lead)}</p>
  <p class="np-note">${escapeHtml(biz.note)}</p>
  <ol>${services}</ol>
</section>
<section id="hc-vision" class="np-vision" aria-labelledby="hc-vision-title">
  <p class="np-kicker">${escapeHtml(vision.kicker)}</p>
  <h2 id="hc-vision-title" class="np-display">${br(vision.title)}</h2>
  <p class="np-lead">${escapeHtml(vision.lead)}</p>
  <p class="np-lead">${escapeHtml(vision.lead2)}</p>
  <ol class="np-pillars">${pillars}</ol>
</section>
<section class="np-projects" aria-label="${escapeHtml(biz.kicker)}">
  <div class="np-stack">${cards}</div>
</section>
<section id="hc-ecosystem" class="np-end" aria-labelledby="hc-eco-title">
  <p class="np-kicker">${escapeHtml(eco.kicker)}</p>
  <p class="np-brand">${escapeHtml(eco.brand)}</p>
  <h2 id="hc-eco-title" class="np-display">${br(eco.title)}</h2>
  <p class="np-lead">${escapeHtml(eco.lead)}</p>
  <p class="np-lead">${escapeHtml(eco.lead2)}</p>
  <ul class="np-names">${names}</ul>
  <div class="np-actions">
    <a class="np-pill np-pill--solid" href="${escapeHtml(href(L, eco.ctaHref))}">${escapeHtml(eco.cta)}</a>
  </div>
</section>
<section id="hc-about" class="np-end np-end--last" aria-labelledby="hc-about-title">
  <video class="np-end__film" muted loop autoplay playsinline webkit-playsinline preload="auto" disablepictureinpicture src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260422_112520_ee819691-f2e8-4c54-bb77-3fb72c84eaa5.mp4" aria-hidden="true"></video>
  <p class="np-kicker">${escapeHtml(about.kicker)}</p>
  <h2 id="hc-about-title" class="np-display">${br(about.title)}</h2>
  <p class="np-lead">${escapeHtml(about.lead)}</p>
  <p class="np-lead">${escapeHtml(about.lead2)}</p>
  <div class="np-actions">
    <a class="np-pill" href="${escapeHtml(href(L, biz.ctaAboutHref))}">${escapeHtml(biz.ctaAbout)}</a>
    <a class="np-pill np-pill--solid" href="${escapeHtml(href(L, about.aboutHref))}">${escapeHtml(about.aboutCta)}</a>
    <a class="np-pill np-pill--solid" href="${escapeHtml(href(L, about.inquiryHref))}">${escapeHtml(about.inquiryCta)}</a>
    <a class="np-pill" href="${escapeHtml(href(L, biz.ctaInquiryHref))}">${escapeHtml(biz.ctaInquiry)}</a>
  </div>
</section>
</div>`;
}
