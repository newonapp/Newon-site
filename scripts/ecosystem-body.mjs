import { escapeHtml } from "./hub-utils.mjs";
import { getEcosystemCopy } from "./ecosystem-copy.mjs";

export const ECO_MP4 =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

function head(label, titleHtml, extraClass = "") {
  return `<header class="eco-block__head${extraClass ? ` ${extraClass}` : ""}">
      <p class="eco-kicker" data-eco-reveal>${escapeHtml(label)}</p>
      <h2 class="eco-title" data-eco-reveal data-eco-delay="1">${titleHtml}</h2>
    </header>`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function areaRow(area, more, i) {
  return `<a class="eco-proc" href="${escapeHtml(area.href)}" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
      <span class="eco-proc__n">${pad(i + 1)}</span>
      <h3 class="eco-proc__name">${escapeHtml(area.name)}</h3>
      <p class="eco-proc__desc">${escapeHtml(area.desc)}</p>
      <span class="eco-proc__go">${escapeHtml(more)}</span>
    </a>`;
}

function menuRow(menu, i) {
  const status = menu.status
    ? `<span class="eco-board__status">${escapeHtml(menu.status)}</span>`
    : "";
  return `<a class="eco-board__item" href="${escapeHtml(menu.href)}" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
      <span class="eco-board__n">${pad(i + 1)}</span>
      ${status}
      <h3 class="eco-board__name">${escapeHtml(menu.name)}</h3>
      <p class="eco-board__lead">${escapeHtml(menu.title)}</p>
      <p class="eco-board__desc">${escapeHtml(menu.desc)}</p>
      <span class="eco-board__cta">${escapeHtml(menu.cta)}</span>
    </a>`;
}

function mapHtml(s4) {
  const nodes = s4.nodes
    .map(
      (node, i) =>
        `<a class="eco-chain__item" href="${escapeHtml(node.href)}" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
          <span class="eco-chain__n">${pad(i + 1)}</span>
          <span class="eco-chain__name">${escapeHtml(node.name)}</span>
        </a>`
    )
    .join("");
  return `<div class="eco-chain" data-eco-map>
      <p class="eco-chain__hub" data-eco-reveal>${escapeHtml(s4.center)}</p>
      <div class="eco-chain__row">${nodes}</div>
    </div>`;
}

function storyHtml(c) {
  const areas = c.s2.areas.map((area, i) => areaRow(area, c.more, i)).join("");
  const menus = c.s3.menus.map((menu, i) => menuRow(menu, i)).join("");
  const nowItems = c.s5.nowItems
    .map((item, i) => `<li data-eco-reveal data-eco-delay="${i}"><span>${pad(i + 1)}</span><strong>${escapeHtml(item)}</strong></li>`)
    .join("");
  const nextItems = c.s5.nextItems
    .map((item, i) => `<li data-eco-reveal data-eco-delay="${i + 3}"><span>${pad(i + 1)}</span><strong>${escapeHtml(item)}</strong></li>`)
    .join("");
  const btns = c.s6.btns
    .map(
      (btn) =>
        `<a class="eco-btn${btn.kind === "primary" ? "" : " eco-btn--ghost"}" href="${escapeHtml(btn.href)}">${escapeHtml(btn.label)}</a>`
    )
    .join("");

  return `<div class="eco-story">
  <section class="eco-block eco-block--intro" id="eco-intro" aria-labelledby="eco-s1-title">
    <div class="eco-wrap">
      <div class="eco-split">
        ${head(c.s1.label, `<span id="eco-s1-title">${c.s1.titleHtml}</span>`)}
        <ol class="eco-roster">
          <li data-eco-reveal data-eco-delay="2"><span>01</span><p>${escapeHtml(c.s1.p1)}</p></li>
          <li data-eco-reveal data-eco-delay="3"><span>02</span><p>${escapeHtml(c.s1.p2)}</p></li>
        </ol>
      </div>
    </div>
  </section>

  <section class="eco-block eco-block--band eco-block--areas" id="eco-areas" aria-labelledby="eco-s2-title">
    <div class="eco-wrap">
      ${head(c.s2.label, `<span id="eco-s2-title">${c.s2.titleHtml}</span>`)}
      <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s2.p1)}</p>
      <p class="eco-note" data-eco-reveal data-eco-delay="3">${escapeHtml(c.s2.p2)}</p>
      <div class="eco-proc-grid">${areas}</div>
    </div>
  </section>

  <section class="eco-block eco-block--commerce" id="eco-commerce" aria-labelledby="eco-s3-title">
    <div class="eco-wrap">
      ${head(c.s3.label, `<span id="eco-s3-title">${c.s3.titleHtml}</span>`)}
      <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s3.lead)}</p>
      <div class="eco-board">${menus}</div>
    </div>
  </section>

  <section class="eco-block eco-block--band eco-block--connect" id="eco-connect" aria-labelledby="eco-s4-title">
    <div class="eco-wrap eco-wrap--center">
      ${head(c.s4.label, `<span id="eco-s4-title">${c.s4.titleHtml}</span>`)}
      <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s4.lead)}</p>
      ${mapHtml(c.s4)}
    </div>
  </section>

  <section class="eco-block eco-block--next" id="eco-next" aria-labelledby="eco-s5-title">
    <div class="eco-wrap">
      ${head(c.s5.label, `<span id="eco-s5-title">${c.s5.titleHtml}</span>`)}
      <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s5.p1)}</p>
      <p class="eco-note" data-eco-reveal data-eco-delay="3">${escapeHtml(c.s5.p2)}</p>
      <div class="eco-lanes">
        <article class="eco-lane" data-eco-reveal>
          <p class="eco-lane__label">${escapeHtml(c.s5.now)}</p>
          <ol class="eco-index">${nowItems}</ol>
        </article>
        <article class="eco-lane eco-lane--next" data-eco-reveal data-eco-delay="2">
          <p class="eco-lane__label">${escapeHtml(c.s5.next)}</p>
          <ol class="eco-index">${nextItems}</ol>
        </article>
      </div>
    </div>
  </section>

  <section class="eco-block eco-block--band eco-block--close" id="eco-explore" aria-labelledby="eco-s6-title">
    <div class="eco-wrap eco-wrap--center">
      ${head(c.s6.label, `<span id="eco-s6-title">${c.s6.titleHtml}</span>`)}
      <p class="eco-lead" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s6.lead)}</p>
      <div class="eco-actions" data-eco-reveal data-eco-delay="3">${btns}</div>
    </div>
  </section>
</div>`;
}

export function renderEcosystemSection(lang) {
  const c = getEcosystemCopy(lang || "en");
  return `<section id="ecosystem-detail" class="eco" data-story="ecosystem" aria-label="Newon Ecosystem">
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
        <h1 class="eco-film__wordmark">Newon Ecosystem</h1>
        <p class="eco-film__slogan">${c.sloganHtml}</p>
        <p class="eco-film__lead">${c.leadHtml}</p>
      </div>
    </div>
  </div>
  ${storyHtml(c)}
</section>`;
}
