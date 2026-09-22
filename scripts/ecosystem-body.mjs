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
  return `<a class="eco-area" href="${escapeHtml(area.href)}" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
      <span class="eco-area__n">${pad(i + 1)}</span>
      <span class="eco-area__name">${escapeHtml(area.name)}</span>
      <span class="eco-area__desc">${escapeHtml(area.desc)}</span>
      <span class="eco-area__go">${escapeHtml(more)}</span>
    </a>`;
}

function menuRow(menu, i) {
  const status = menu.status
    ? `<span class="eco-menu__status">${escapeHtml(menu.status)}</span>`
    : "";
  return `<a class="eco-menu" href="${escapeHtml(menu.href)}" data-eco-reveal data-eco-delay="${Math.min(i, 5)}">
      <span class="eco-menu__n">${pad(i + 1)}</span>
      <p class="eco-menu__name">${escapeHtml(menu.name)}</p>
      <div class="eco-menu__body">
        ${status}
        <p class="eco-menu__lead">${escapeHtml(menu.title)}</p>
        <p class="eco-menu__desc">${escapeHtml(menu.desc)}</p>
        <span class="eco-menu__cta">${escapeHtml(menu.cta)}</span>
      </div>
    </a>`;
}

function ecoPoint(deg, r, cx = 300, cy = 300) {
  const a = (deg * Math.PI) / 180;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
}

function mapHtml(s4) {
  const angles = [-90, -30, 30, 90, 150, 210];
  const spokes = angles
    .map((deg) => {
      const [x, y] = ecoPoint(deg, 214);
      return `<line x1="300" y1="300" x2="${x}" y2="${y}" />`;
    })
    .join("");
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg = i * 5 - 90;
    const [x1, y1] = ecoPoint(deg, i % 6 === 0 ? 236 : 240);
    const [x2, y2] = ecoPoint(deg, 248);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }).join("");
  const nodes = s4.nodes
    .map(
      (node, i) =>
        `<a class="eco-orbit__node eco-orbit__node--${i}" href="${escapeHtml(node.href)}" data-eco-reveal data-eco-delay="${i + 1}">
          <span class="eco-orbit__num">${pad(i + 1)}</span>
          <span class="eco-orbit__lab">${escapeHtml(node.name)}</span>
        </a>`
    )
    .join("");
  return `<div class="eco-orbit" data-eco-map>
      <svg class="eco-orbit__lines" viewBox="0 0 600 600" aria-hidden="true">
        <g class="eco-orbit__rings" fill="none">
          <circle cx="300" cy="300" r="228" />
          <circle class="eco-orbit__ring-mid" cx="300" cy="300" r="176" />
          <circle cx="300" cy="300" r="86" />
        </g>
        <g class="eco-orbit__ticks">${ticks}</g>
        <g class="eco-orbit__spokes">${spokes}</g>
      </svg>
      <p class="eco-orbit__hub" data-eco-reveal>${escapeHtml(s4.center)}</p>
      ${nodes}
    </div>`;
}

function storyHtml(c) {
  const areas = c.s2.areas.map((area, i) => areaRow(area, c.more, i)).join("");
  const menus = c.s3.menus.map((menu, i) => menuRow(menu, i)).join("");
  const nowItems = c.s5.nowItems
    .map((item, i) => `<li class="eco-rail__item" data-eco-reveal data-eco-delay="${i}"><span>${pad(i + 1)}</span>${escapeHtml(item)}</li>`)
    .join("");
  const nextItems = c.s5.nextItems
    .map((item, i) => `<li class="eco-rail__item eco-rail__item--next" data-eco-reveal data-eco-delay="${i + 3}"><span>${pad(i + 1)}</span>${escapeHtml(item)}</li>`)
    .join("");
  const btns = c.s6.btns
    .map(
      (btn) =>
        `<a class="btn ${btn.kind === "primary" ? "btn-primary" : "btn-ghost"}" href="${escapeHtml(btn.href)}">${escapeHtml(btn.label)}</a>`
    )
    .join("");

  return `<div class="eco-story">
  <section class="eco-block eco-block--intro" id="eco-intro" aria-labelledby="eco-s1-title">
    <div class="eco-wrap eco-wrap--intro">
      <p class="eco-chapter" aria-hidden="true" data-eco-reveal>01</p>
      <div class="eco-intro">
        ${head(c.s1.label, `<span id="eco-s1-title">${c.s1.titleHtml}</span>`)}
        <div class="eco-intro__copy">
          <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s1.p1)}</p>
          <p class="eco-copy eco-copy--soft" data-eco-reveal data-eco-delay="3">${escapeHtml(c.s1.p2)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="eco-block eco-block--areas" id="eco-areas" aria-labelledby="eco-s2-title">
    <div class="eco-wrap">
      ${head(c.s2.label, `<span id="eco-s2-title">${c.s2.titleHtml}</span>`, "eco-block__head--split")}
      <div class="eco-areas__lead">
        <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s2.p1)}</p>
        <p class="eco-copy eco-copy--soft" data-eco-reveal data-eco-delay="3">${escapeHtml(c.s2.p2)}</p>
      </div>
      <div class="eco-areas">${areas}</div>
    </div>
  </section>

  <section class="eco-block eco-block--commerce" id="eco-commerce" aria-labelledby="eco-s3-title">
    <div class="eco-wrap">
      ${head(c.s3.label, `<span id="eco-s3-title">${c.s3.titleHtml}</span>`)}
      <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s3.lead)}</p>
      <div class="eco-menus">${menus}</div>
    </div>
  </section>

  <section class="eco-block eco-block--connect" id="eco-connect" aria-labelledby="eco-s4-title">
    <div class="eco-wrap eco-wrap--connect">
      ${head(c.s4.label, `<span id="eco-s4-title">${c.s4.titleHtml}</span>`)}
      <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s4.lead)}</p>
      ${mapHtml(c.s4)}
    </div>
  </section>

  <section class="eco-block eco-block--next" id="eco-next" aria-labelledby="eco-s5-title">
    <div class="eco-wrap">
      ${head(c.s5.label, `<span id="eco-s5-title">${c.s5.titleHtml}</span>`)}
      <div class="eco-next__lead">
        <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s5.p1)}</p>
        <p class="eco-copy eco-copy--soft" data-eco-reveal data-eco-delay="3">${escapeHtml(c.s5.p2)}</p>
      </div>
      <div class="eco-rail">
        <div class="eco-rail__col eco-rail__col--now">
          <p class="eco-rail__label" data-eco-reveal>${escapeHtml(c.s5.now)}</p>
          <ol class="eco-rail__list">${nowItems}</ol>
        </div>
        <div class="eco-rail__col eco-rail__col--next">
          <p class="eco-rail__label" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s5.next)}</p>
          <ol class="eco-rail__list">${nextItems}</ol>
        </div>
      </div>
    </div>
  </section>

  <section class="eco-block eco-block--close" id="eco-explore" aria-labelledby="eco-s6-title">
    <div class="eco-wrap eco-wrap--narrow">
      ${head(c.s6.label, `<span id="eco-s6-title">${c.s6.titleHtml}</span>`)}
      <p class="eco-copy" data-eco-reveal data-eco-delay="2">${escapeHtml(c.s6.lead)}</p>
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
