/**
 * Business explore hub — film hero + Business overview / menu (render-bsp.mjs, Oct 2026 restructure).
 * The old service pillars (business-services-html.mjs) and close (business-explore-close.mjs) are no longer
 * shown here: Newon Business is presented as its own products, not client build services.
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { bspHubHtml, bspHubFilmCtas } from "./render-bsp.mjs";
import { BIZ_FILM_SRC, getBusinessFilmCopy } from "./business-film-copy.mjs";

const CSS_V = "20260923pad1";
const FILM_V = "20260922fade2";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

export function businessExploreHtml(flat, flatEn, lang = "en") {
  const ko = lang === "ko";
  const film = getBusinessFilmCopy(lang);
  const services = bspHubHtml("business", lang);
  const ctas = bspHubFilmCtas("business", lang);
  const oldTitle = t(
    flat,
    flatEn,
    "business.exploreTitle",
    ko ? "기업과 소상공인을 위한 SaaS · AI." : "SaaS and AI for companies and small businesses."
  ).replace(/<br\s*\/?>/g, " ");
  const oldLead = t(flat, flatEn, "business.exploreLead", "");

  return `<link rel="stylesheet" href="/business-type.css?v=20260827type4" />
<link rel="stylesheet" href="/newon-studio.css?v=${CSS_V}" />
<link rel="stylesheet" href="/business-page.css?v=${CSS_V}" />
<link rel="stylesheet" href="/business-pillar.css?v=${CSS_V}" />
<link rel="stylesheet" href="/business-film.css?v=${FILM_V}" />
<section id="business-film" class="bz-film" data-bz-film data-lockup-reveal aria-label="Newon Business">
  <div class="bz-film__stage">
    <div class="bz-film__fallback" aria-hidden="true"></div>
    <video
      class="bz-film__video"
      src="${escapeHtml(BIZ_FILM_SRC)}"
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
      <source src="${escapeHtml(BIZ_FILM_SRC)}" type="video/mp4" />
    </video>
    <div class="bz-film__lockup">
      <div class="bz-film__veil" aria-hidden="true"></div>
      <h1 class="bz-film__wordmark">Newon Business</h1>
      <p class="visually-hidden">${oldTitle} ${oldLead}</p>
      <p class="bz-film__slogan">${film.sloganHtml}</p>
      <p class="bz-film__lead">${film.leadHtml}</p>
      <div class="bz-film__actions">
        <a class="btn btn-ghost" href="${ctas.explore[1]}">${escapeHtml(ctas.explore[0])}</a>
        <a class="btn btn-primary" href="${ctas.primary[1]}">${escapeHtml(ctas.primary[0])}</a>
      </div>
    </div>
  </div>
</section>
<div class="ns-studio-menu bz-page">
  ${services}
</div>
<script src="/film-keep.js?v=20260924play2"></script>
<script src="/business-film.js?v=${FILM_V}" defer></script>
<script src="/business-pillar.js?v=${CSS_V}" defer></script>`;
}
