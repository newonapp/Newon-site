import { getEcosystemCopy } from "./ecosystem-copy.mjs";

export const ECO_MP4 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export function renderEcosystemSection(lang) {
  const c = getEcosystemCopy(lang || "en");
  return `<section id="ecosystem-detail" class="eco" data-story="ecosystem" aria-label="Newon Ecosystem">
  <div class="eco-film" data-eco-film>
    <div class="eco-film__stage">
      <div class="eco-film__fallback" aria-hidden="true"></div>
      <video
        class="eco-film__video"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        disablepictureinpicture
        controlslist="nodownload nofullscreen noremoteplayback"
        aria-hidden="true"
      >
        <source src="${ECO_MP4}" type="video/mp4" />
      </video>
      <div class="eco-film__lockup">
        <div class="eco-film__veil" aria-hidden="true"></div>
        <h1 class="eco-film__wordmark">Newon Ecosystem</h1>
        <p class="eco-film__slogan">${c.sloganHtml}</p>
        <p class="eco-film__lead">${c.leadHtml}</p>
      </div>
    </div>
  </div>
</section>`;
}
