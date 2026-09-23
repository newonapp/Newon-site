import { escapeHtml } from "./hub-utils.mjs";
import { getEcosystemCopy } from "./ecosystem-copy.mjs";
import { getEcoApps, getOrbitApps, appBySlug, ECO_GROUPS } from "./ecosystem-apps.mjs";

export const ECO_MP4 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

function appTile(app, extraClass = "") {
  return `<a class="eco-app${extraClass ? ` ${extraClass}` : ""}" href="${escapeHtml(app.href)}">
    <img class="eco-app__logo" src="${escapeHtml(app.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async" />
    <span class="eco-app__meta">
      <span class="eco-app__name">${escapeHtml(app.name)}</span>
      <span class="eco-app__role">${escapeHtml(app.role)}</span>
    </span>
  </a>`;
}

function chip(app) {
  if (!app) return "";
  return `<a class="eco-chip" href="${escapeHtml(app.href)}">
    <img src="${escapeHtml(app.icon)}" alt="" width="28" height="28" loading="lazy" decoding="async" />
    <span>${escapeHtml(app.name)}</span>
  </a>`;
}

function chipsFor(slugs, bySlug) {
  return (slugs || [])
    .map((slug) => chip(bySlug[slug]))
    .filter(Boolean)
    .join("");
}

function head(kicker, titleHtml, id, lead) {
  return `<header class="eco-head">
    <p class="eco-kicker" data-eco-reveal>${escapeHtml(kicker)}</p>
    <h2 class="eco-title" id="${escapeHtml(id)}" data-eco-reveal data-eco-delay="1">${titleHtml}</h2>
    ${lead ? `<p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(lead)}</p>` : ""}
  </header>`;
}

function flowPills(names) {
  return names
    .map((name, i) => {
      const arrow = i < names.length - 1 ? `<span class="eco-flow__arrow" aria-hidden="true">→</span>` : "";
      return `<span class="eco-flow__item">${escapeHtml(name)}</span>${arrow}`;
    })
    .join("");
}

export function renderEcosystemSection(lang) {
  const L = lang || "en";
  const c = getEcosystemCopy(L);
  const plus = appBySlug("newon-plus", L);
  const all = getEcoApps(L);
  const orbit = getOrbitApps(L);
  const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));

  const keys = c.keys
    .map((k) => `<li>${escapeHtml(k)}</li>`)
    .join("");

  const steps = c.steps
    .map(
      (s, i) => `<li class="eco-step" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
      <span class="eco-step__n">${escapeHtml(s.n)}</span>
      <div class="eco-step__body">
        <strong class="eco-step__title">${escapeHtml(s.title)}</strong>
        <p>${escapeHtml(s.body)}</p>
      </div>
    </li>`
    )
    .join("");

  const mapGroups = ECO_GROUPS.map((g, gi) => {
    const tiles = g.slugs.map((slug) => appTile(bySlug[slug])).join("");
    return `<div class="eco-map__group eco-map__group--${escapeHtml(g.id)}" data-eco-reveal data-eco-delay="${Math.min(gi, 4)}">
      <p class="eco-map__label">${escapeHtml(c.groupLabels[g.id])}</p>
      <div class="eco-map__apps">${tiles}</div>
    </div>`;
  }).join("");

  const domains = c.domains
    .map((d, i) => {
      const tiles = d.slugs.map((slug) => appTile(bySlug[slug])).join("");
      const flow = d.flow
        ? `<p class="eco-flow">${flowPills(d.flow)}</p>
           <p class="eco-note">${escapeHtml(d.flowNote)}</p>`
        : d.flowNote
          ? `<p class="eco-note">${escapeHtml(d.flowNote)}</p>`
          : "";
      return `<article class="eco-domain" data-eco-reveal data-eco-delay="${Math.min(i, 4)}">
        <p class="eco-domain__n">${String(i + 1).padStart(2, "0")}</p>
        <div class="eco-domain__copy">
          <h3 class="eco-domain__title">${escapeHtml(d.title)}</h3>
          <p class="eco-domain__lead">${escapeHtml(d.lead)}</p>
          ${flow}
        </div>
        <div class="eco-domain__apps">${tiles}</div>
      </article>`;
    })
    .join("");

  const journeys = c.flows
    .map(
      (f, i) => `<article class="eco-journey" data-eco-reveal data-eco-delay="${Math.min(i, 4)}">
      <p class="eco-journey__n">${escapeHtml(f.n)}</p>
      <h3 class="eco-journey__title">${escapeHtml(f.title)}</h3>
      <ol class="eco-journey__steps">${f.steps.map((s, si) => `<li><span>${String(si + 1).padStart(2, "0")}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
    </article>`
    )
    .join("");

  const nowItems = c.nowItems
    .map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`)
    .join("");
  const nextItems = c.nextItems
    .map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`)
    .join("");

  const livonStages = c.livonRows
    .map(
      (r, i) => `<article class="eco-stage" data-eco-reveal data-eco-delay="${Math.min(i, 4)}">
      <span class="eco-stage__n">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="eco-stage__title">${escapeHtml(r.label)}</h3>
      <div class="eco-chips">${chipsFor(r.slugs, bySlug)}</div>
    </article>`
    )
    .join("");
  const ongilRails = c.ongilRows
    .map(
      (r, i) => `<li class="eco-rail__item" data-eco-reveal data-eco-delay="${Math.min(i, 4)}">
      <span class="eco-rail__n">${String(i + 1).padStart(2, "0")}</span>
      <div>
        <h3 class="eco-rail__title">${escapeHtml(r.label)}</h3>
        <div class="eco-chips">${chipsFor(r.slugs, bySlug)}</div>
      </div>
    </li>`
    )
    .join("");

  const boardApps = orbit
    .map(
      (app) => `<li>
      <a class="eco-board__app" href="${escapeHtml(app.href)}" title="${escapeHtml(app.name)}">
        <img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)}" width="56" height="56" loading="lazy" decoding="async" />
      </a>
    </li>`
    )
    .join("");

  const visionStrip = orbit
    .map(
      (app) => `<a class="eco-spine__logo" href="${escapeHtml(app.href)}" title="${escapeHtml(app.name)}">
      <img src="${escapeHtml(app.icon)}" alt="${escapeHtml(app.name)}" width="36" height="36" loading="lazy" decoding="async" />
    </a>`
    )
    .join("");

  return `<section id="ecosystem-detail" class="eco" data-story="ecosystem" aria-label="${escapeHtml(c.seoTitle)}">
  <div class="eco-film" data-eco-film>
    <div class="eco-film__stage">
      <div class="eco-film__fallback" aria-hidden="true"></div>
      <video
        class="eco-film__video"
        src="${ECO_MP4}"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        preload="auto"
        disablepictureinpicture
        controlslist="nodownload nofullscreen noremoteplayback"
        aria-hidden="true"
      >
        <source src="${ECO_MP4}" type="video/mp4" />
      </video>
      <div class="eco-film__lockup">
        <div class="eco-film__veil" aria-hidden="true"></div>
        <h1 class="eco-film__wordmark">Newon<br />Ecosystem</h1>
        <p class="eco-film__slogan">${c.sloganHtml}</p>
        <p class="eco-film__lead">${c.leadHtml}</p>
      </div>
      <a class="eco-film__cue" href="#eco-hero" data-cai-scroll>
        <span class="eco-sr">${L === "ko" ? "소개로 이동" : "Continue to the introduction"}</span>
      </a>
    </div>
  </div>
  <section class="eco-hero" id="eco-hero" aria-labelledby="eco-hero-title">
    <div class="eco-wrap eco-hero__grid">
      <div class="eco-hero__copy">
        <p class="eco-kicker" data-eco-reveal>${escapeHtml(c.heroKicker)}</p>
        <h2 class="eco-hero__title" id="eco-hero-title" data-eco-reveal data-eco-delay="1">${c.heroTitleHtml}</h2>
        <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.heroLead)}</p>
        <p class="eco-lead eco-lead--2" data-eco-reveal data-eco-delay="2">${escapeHtml(c.heroLead2)}</p>
        <ul class="eco-keys" data-eco-reveal data-eco-delay="3">${keys}</ul>
        <div class="eco-hero__actions" data-eco-reveal data-eco-delay="3">
          <a class="eco-btn eco-btn--solid" href="#eco-login">${escapeHtml(c.heroPrimary)}</a>
          <a class="eco-btn eco-btn--line" href="#eco-commerce">${escapeHtml(c.heroGhost)}</a>
        </div>
      </div>
      <div class="eco-hero__visual">
        <div class="eco-board" data-eco-reveal data-eco-delay="2">
          <a class="eco-board__plus" href="${escapeHtml(plus.href)}">
            <img src="${escapeHtml(plus.icon)}" alt="" width="72" height="72" decoding="async" />
            <span>
              <strong>${escapeHtml(plus.name)}</strong>
              <em>${escapeHtml(plus.role)}</em>
            </span>
          </a>
          <ul class="eco-board__apps">${boardApps}</ul>
        </div>
        <p class="eco-hint">${escapeHtml(c.orbitHint)}</p>
      </div>
    </div>
  </section>

  <section class="eco-block" id="eco-login" aria-labelledby="eco-login-title">
    <div class="eco-wrap">
      ${head(c.loginKicker, c.loginTitleHtml, "eco-login-title", c.loginLead)}
      <p class="eco-note" data-eco-reveal>${escapeHtml(c.loginNote)}</p>
      <ol class="eco-steps">${steps}</ol>
      <aside class="eco-member" data-eco-reveal>
        <div>
          <h3>${escapeHtml(c.memberTitle)}</h3>
          <p>${escapeHtml(c.memberBody)}</p>
        </div>
        <p class="eco-member__actions">
          <a href="${escapeHtml(c.memberHref)}">${escapeHtml(c.memberCta)}</a>
          <a href="${escapeHtml(c.packHref)}">${escapeHtml(c.packCta)}</a>
        </p>
      </aside>
    </div>
  </section>

  <section class="eco-block eco-block--band" id="eco-commerce" aria-labelledby="eco-map-title">
    <div class="eco-wrap">
      ${head(c.mapKicker, c.mapTitleHtml, "eco-map-title", c.mapLead)}
      <div class="eco-map">
        <div class="eco-map__hub" data-eco-reveal>
          ${appTile(plus, "eco-app--hub")}
          <p class="eco-map__hub-label">${escapeHtml(c.mapPlusLabel)}</p>
        </div>
        <div class="eco-map__grid">${mapGroups}</div>
      </div>
    </div>
  </section>

  <section class="eco-block" id="eco-domains" aria-labelledby="eco-domains-title">
    <div class="eco-wrap">
      ${head(c.domainsKicker, c.domainsTitleHtml, "eco-domains-title", c.domainsIntro)}
      <div class="eco-domains">${domains}</div>
    </div>
  </section>

  <section class="eco-block eco-block--band" id="eco-flows" aria-labelledby="eco-flows-title">
    <div class="eco-wrap">
      ${head(c.flowsKicker, c.flowsTitleHtml, "eco-flows-title", c.flowsLead)}
      <div class="eco-journeys">${journeys}</div>
    </div>
  </section>

  <section class="eco-block" id="eco-now" aria-labelledby="eco-now-title">
    <div class="eco-wrap">
      ${head(c.nowKicker, c.nowTitleHtml, "eco-now-title")}
      <div class="eco-split">
        <article class="eco-lane" data-eco-reveal>
          <p class="eco-lane__label">${escapeHtml(c.nowLabel)}</p>
          <ol class="eco-index">${nowItems}</ol>
        </article>
        <article class="eco-lane eco-lane--next" data-eco-reveal data-eco-delay="2">
          <p class="eco-lane__label">${escapeHtml(c.nextLabel)} <em class="eco-badge">${escapeHtml(c.nextBadge)}</em></p>
          <ol class="eco-index">${nextItems}</ol>
        </article>
      </div>
    </div>
  </section>

  <section class="eco-block eco-expand" id="eco-livon" aria-labelledby="eco-livon-title">
    <div class="eco-wrap">
      ${head(c.livonKicker, c.livonTitleHtml, "eco-livon-title", c.livonLead)}
      <div class="eco-stages">${livonStages}</div>
      <p class="eco-note"><em class="eco-badge">${escapeHtml(c.livonBadge)}</em> ${escapeHtml(c.livonNote)}</p>
      <p class="eco-more"><a href="${escapeHtml(c.livonHref)}">${escapeHtml(c.livonCta)}</a></p>
    </div>
  </section>

  <section class="eco-block eco-expand eco-expand--rail" id="eco-ongil" aria-labelledby="eco-ongil-title">
    <div class="eco-wrap">
      ${head(c.ongilKicker, c.ongilTitleHtml, "eco-ongil-title", c.ongilLead)}
      <ol class="eco-rail">${ongilRails}</ol>
      <p class="eco-note"><em class="eco-badge">${escapeHtml(c.ongilBadge)}</em> ${escapeHtml(c.ongilNote)}</p>
      <p class="eco-more"><a href="${escapeHtml(c.ongilHref)}">${escapeHtml(c.ongilCta)}</a></p>
    </div>
  </section>

  <section class="eco-block eco-expand" id="eco-vision" aria-labelledby="eco-vision-title">
    <div class="eco-wrap">
      ${head(c.visionKicker, c.visionTitleHtml, "eco-vision-title", c.visionLead)}
      <div class="eco-spine" data-eco-reveal>
        <a class="eco-spine__hub" href="${escapeHtml(plus.href)}">
          <img src="${escapeHtml(plus.icon)}" alt="" width="56" height="56" />
          <span>
            <strong>${escapeHtml(plus.name)}</strong>
            <em>${escapeHtml(c.visionHub)}</em>
          </span>
        </a>
        <div class="eco-spine__strip">${visionStrip}</div>
        <p class="eco-spine__to"><span class="eco-badge">${escapeHtml(c.visionFuture)}</span></p>
        <div class="eco-spine__next">
          <a class="eco-spine__card" href="${escapeHtml(c.livonHref)}">
            <strong>LivOn</strong>
            <span>${escapeHtml(c.visionLivonRole)}</span>
            <em>${escapeHtml(c.visionLivonWho)}</em>
            <b class="eco-badge">${escapeHtml(c.nextBadge)}</b>
          </a>
          <a class="eco-spine__card" href="${escapeHtml(c.ongilHref)}">
            <strong>Ongil</strong>
            <span>${escapeHtml(c.visionOngilRole)}</span>
            <em>${escapeHtml(c.visionOngilWho)}</em>
            <b class="eco-badge">${escapeHtml(c.nextBadge)}</b>
          </a>
        </div>
        <p class="eco-vision__ai">${escapeHtml(c.visionAi)}</p>
      </div>
    </div>
  </section>

  <section class="eco-block eco-block--close" id="eco-cta" aria-labelledby="eco-cta-title">
    <div class="eco-wrap">
      ${head(c.ctaKicker, c.ctaTitleHtml, "eco-cta-title", c.ctaLead)}
      <div class="eco-actions" data-eco-reveal data-eco-delay="3">
        <a class="eco-btn eco-btn--on-ink" href="${escapeHtml(c.ctaPlusHref)}">${escapeHtml(c.ctaPlus)}</a>
        <a class="eco-btn eco-btn--ghost" href="${escapeHtml(c.ctaAppsHref)}">${escapeHtml(c.ctaApps)}</a>
      </div>
      <p class="eco-actions eco-actions--sub" data-eco-reveal>
        <a href="${escapeHtml(c.livonHref)}">${escapeHtml(c.ctaLivon)}</a>
        <a href="${escapeHtml(c.ongilHref)}">${escapeHtml(c.ctaOngil)}</a>
      </p>
    </div>
  </section>
</section>`;
}
