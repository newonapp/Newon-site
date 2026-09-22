/**
 * New homepage company-story blocks only.
 * Does not touch the existing 6 business story sections.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getCompanyStoryCopy } from "./home-company-copy.mjs";
import { getStoryCopy } from "./home-biz-copy.mjs";

function langDir(lang) {
  return lang || "en";
}

function pageHref(lang, path) {
  if (!path || path.startsWith("#") || path.startsWith("/") || /^https?:/.test(path)) return path;
  return `/${langDir(lang)}/${path.replace(/^\.\//, "")}`;
}

function nl(text) {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

function meaningHtml(c) {
  const m = c.meaning;
  return `<section id="hc-meaning" class="hc-sec hc-meaning" data-hs-section data-hc-meaning aria-labelledby="hc-meaning-title">
  <div class="hc-meaning__track">
    <div class="hc-meaning__sticky">
      <p class="hc-kicker">${escapeHtml(m.kicker)}</p>
      <h2 id="hc-meaning-title" class="hc-meaning__brand">
        <span class="hc-formula" data-hc-formula aria-hidden="true">
          <span class="hc-formula__new" data-hc-new>New</span>
          <span class="hc-formula__plus" data-hc-plus>+</span>
          <span class="hc-formula__on" data-hc-on>On</span>
        </span>
        <span class="hc-wordmark" data-hc-wordmark>${escapeHtml(m.wordmark)}</span>
        <span class="hc-sr">${escapeHtml(m.formula)} — ${escapeHtml(m.wordmark)}</span>
      </h2>
      <p class="hc-meaning__slogan" data-hc-slogan>${escapeHtml(m.slogan)}</p>
      <p class="hc-meaning__intro" data-hc-intro>${escapeHtml(m.intro)}</p>
      <div class="hc-meaning__defs" data-hc-defs>
        <article class="hc-def" data-hc-def="new">
          <p class="hc-def__en">${escapeHtml(m.newLabel)}</p>
          <h3 class="hc-def__title">${escapeHtml(m.newTitle)}</h3>
          <p class="hc-def__body">${escapeHtml(m.newBody)}</p>
        </article>
        <article class="hc-def" data-hc-def="on">
          <p class="hc-def__en">${escapeHtml(m.onLabel)}</p>
          <h3 class="hc-def__title">${escapeHtml(m.onTitle)}</h3>
          <p class="hc-def__body">${escapeHtml(m.onBody)}</p>
        </article>
      </div>
      <p class="hc-meaning__eq" data-hc-eq>${escapeHtml(m.closeEq)}</p>
      <p class="hc-meaning__close" data-hc-close>${nl(m.closeLead)}</p>
    </div>
  </div>
</section>`;
}

function visionHtml(c) {
  const v = c.vision;
  const pillars = v.pillars
    .map(
      (p) => `<article class="hc-pillar" data-hc-pillar>
      <p class="hc-pillar__n">${escapeHtml(p.n)} / ${escapeHtml(p.en)}</p>
      <h3 class="hc-pillar__title">${escapeHtml(p.title)}</h3>
      <p class="hc-pillar__body">${escapeHtml(p.body)}</p>
    </article>`
    )
    .join("");
  return `<section id="hc-vision" class="hc-sec hc-vision" data-hs-section data-hc-vision aria-labelledby="hc-vision-title">
  <div class="hc-inner">
    <p class="hc-kicker">${escapeHtml(v.kicker)}</p>
    <h2 id="hc-vision-title" class="hc-title">${nl(v.title)}</h2>
    <p class="hc-lead">${escapeHtml(v.lead)}</p>
    <p class="hc-lead hc-lead--2">${escapeHtml(v.lead2)}</p>
    <div class="hc-pillars">${pillars}</div>
  </div>
</section>`;
}

function ecoHtml(c, note) {
  const e = c.eco;
  const names = e.names
    .map((n) => `<li class="hc-eco__name">${escapeHtml(n)}</li>`)
    .join("");
  return `<section id="hc-ecosystem" class="hc-sec hc-eco" data-hs-section data-hc-eco aria-labelledby="hc-eco-title">
  <div class="hc-inner hc-inner--center">
    <p class="hc-kicker">${escapeHtml(e.kicker)}</p>
    <p class="hc-eco__brand" aria-hidden="true">${escapeHtml(e.brand)}</p>
    <h2 id="hc-eco-title" class="hc-title">${nl(e.title)}</h2>
    <p class="hc-lead">${escapeHtml(e.lead)}</p>
    <p class="hc-lead hc-lead--2">${escapeHtml(e.lead2)}</p>
    ${note ? `<p class="hc-eco__note">${escapeHtml(note)}</p>` : ""}
    <ul class="hc-eco__names">${names}</ul>
    <div class="hc-actions">
      <a class="hs-story__cta" href="${escapeHtml(e.ctaHref)}">${escapeHtml(e.cta)}</a>
    </div>
  </div>
</section>`;
}

function aboutHtml(c) {
  const a = c.about;
  return `<section id="hc-about" class="hc-sec hc-about" data-hs-section data-hc-about aria-labelledby="hc-about-title">
  <div class="hc-inner hc-inner--split">
    <div class="hc-about__copy">
      <p class="hc-kicker">${escapeHtml(a.kicker)}</p>
      <h2 id="hc-about-title" class="hc-title">${nl(a.title)}</h2>
      <p class="hc-lead">${escapeHtml(a.lead)}</p>
      <p class="hc-lead hc-lead--2">${escapeHtml(a.lead2)}</p>
    </div>
    <div class="hc-actions hc-actions--about">
      <a class="hs-story__cta hs-story__cta--ghost" href="${escapeHtml(a.aboutHref)}">${escapeHtml(a.aboutCta)}</a>
      <a class="hs-story__cta" href="${escapeHtml(a.inquiryHref)}">${escapeHtml(a.inquiryCta)}</a>
    </div>
  </div>
</section>`;
}

export function renderCompanyBefore(lang) {
  const L = lang || "en";
  const c = getCompanyStoryCopy(L);
  return `${meaningHtml(c)}
${visionHtml(c)}`;
}

export function renderCompanyAfter(lang) {
  const L = lang || "en";
  const c = getCompanyStoryCopy(L);
  const story = getStoryCopy(L);
  const eco = {
    ...c.eco,
    ctaHref: pageHref(L, c.eco.ctaHref),
  };
  const about = {
    ...c.about,
    aboutHref: pageHref(L, c.about.aboutHref),
    inquiryHref: pageHref(L, c.about.inquiryHref),
  };
  return `${ecoHtml({ ...c, eco }, story.eco && story.eco.note)}
${aboutHtml({ ...c, about })}`;
}
