/**
 * Newon Consumer AI showcase — logos only, no screenshots/mocks.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadPortfolioApps } from "./portfolio-data.mjs";
import { escapeHtml, pick } from "./hub-utils.mjs";
import {
  CAI_CATEGORIES,
  CAI_SERVICES,
  caiCopy,
  localizeService,
} from "./consumer-ai-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

function logoExists(icon) {
  if (!icon) return false;
  return fs.existsSync(path.join(ROOT, String(icon).replace(/^\//, "")));
}

function statusChip(ui, status) {
  const label = status === "available" ? ui.available : ui.planned;
  const cls = status === "available" ? "is-live" : "is-soon";
  return `<span class="cai-status ${cls}">${escapeHtml(label)}</span>`;
}

function storeButtons(app, ui) {
  const bits = [];
  if (app?.appStoreUrl) {
    bits.push(
      `<a class="cai-store" href="${escapeHtml(app.appStoreUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui.download)} · App Store</a>`
    );
  }
  if (app?.googlePlayUrl && !String(app.googlePlayUrl).startsWith("#")) {
    bits.push(
      `<a class="cai-store" href="${escapeHtml(app.googlePlayUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui.download)} · Google Play</a>`
    );
  }
  return bits.join("");
}

function heroLogos(services) {
  const items = services
    .filter((s) => logoExists(s.icon))
    .map(
      (s) =>
        `<li class="cai-hero-logos__item"><img src="${escapeHtml(s.icon)}" alt="${escapeHtml(s.name)}" width="56" height="56" loading="eager" decoding="async" /></li>`
    )
    .join("");
  return `<ul class="cai-hero-logos" data-cai-logos>${items}</ul>`;
}

function aiCoreVisual(kind = "expand") {
  const expand = kind !== "gather";
  const nodes = [
    [240, 52],
    [368, 108],
    [428, 240],
    [368, 372],
    [240, 428],
    [112, 372],
    [52, 240],
    [112, 108],
  ];
  const lines = nodes
    .map(([x, y], i) => {
      const delay = (i * 0.35).toFixed(2);
      const sx = expand ? 240 : x;
      const sy = expand ? 240 : y;
      const ex = expand ? x : 240;
      const ey = expand ? y : 240;
      return `<line class="cai-core__link" x1="240" y1="240" x2="${x}" y2="${y}" />
      <circle class="cai-core__pulse" cx="${sx}" cy="${sy}" r="2.2">
        <animate attributeName="cx" values="${sx};${ex}" dur="4.8s" begin="${delay}s" repeatCount="indefinite" />
        <animate attributeName="cy" values="${sy};${ey}" dur="4.8s" begin="${delay}s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.9;0" dur="4.8s" begin="${delay}s" repeatCount="indefinite" />
      </circle>`;
    })
    .join("");
  const dots = nodes
    .map(
      ([x, y], i) =>
        `<circle class="cai-core__node" cx="${x}" cy="${y}" r="6" style="--i:${i}" />`
    )
    .join("");
  return `<div class="cai-core cai-core--${escapeHtml(kind)}" data-cai-core="${escapeHtml(kind)}" aria-hidden="true">
    <svg class="cai-core__svg" viewBox="0 0 480 480" width="480" height="480" focusable="false">
      <defs>
        <radialGradient id="cai-core-glow-${kind}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(186,196,255,0.78)" />
          <stop offset="34%" stop-color="rgba(110,124,220,0.34)" />
          <stop offset="100%" stop-color="rgba(92,108,210,0)" />
        </radialGradient>
        <filter id="cai-core-soft-${kind}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle class="cai-core__halo" cx="240" cy="240" r="168" fill="url(#cai-core-glow-${kind})" />
      <circle class="cai-core__ring cai-core__ring--outer" cx="240" cy="240" r="148" />
      <circle class="cai-core__ring cai-core__ring--mid" cx="240" cy="240" r="104" />
      <g class="cai-core__web">${lines}${dots}</g>
      <g class="cai-core__nucleus" filter="url(#cai-core-soft-${kind})">
        <circle class="cai-core__body" cx="240" cy="240" r="58" />
        <circle class="cai-core__inner" cx="240" cy="240" r="34" />
      </g>
      <text class="cai-core__brand" x="240" y="236" text-anchor="middle">NEWON</text>
      <text class="cai-core__brand cai-core__brand--sub" x="240" y="258" text-anchor="middle">AI</text>
    </svg>
  </div>`;
}

function filterBar(ui, flat, flatEn) {
  const keyById = {
    all: "studio.caiFilterAll",
    finance: "studio.caiFilterFinance",
    health: "studio.caiFilterHealth",
    self: "studio.caiFilterSelf",
    travel: "studio.caiFilterTravel",
    game: "studio.caiFilterGame",
  };
  const buttons = CAI_CATEGORIES.map((c, i) => {
    const fb = ui.isKo ? c.labelKo : c.labelEn;
    const label = String(pick(flat, flatEn, keyById[c.id]) || fb);
    const active = i === 0 ? " is-active" : "";
    return `<button type="button" class="cai-filter__btn${active}" data-cai-filter="${escapeHtml(c.id)}" aria-pressed="${i === 0 ? "true" : "false"}">${escapeHtml(label)}</button>`;
  }).join("");
  return `<div class="cai-filter" role="toolbar" aria-label="${escapeHtml(ui.filterAria)}">${buttons}</div>`;
}

function cardHtml(svc, app, ui, lang) {
  const L = localizeService(svc, lang);
  const feats = (L.cardFeatures || []).slice(0, 3)
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join("");
  const icon = logoExists(svc.icon) ? svc.icon : "";
  const img = icon
    ? `<img class="cai-card__logo" src="${escapeHtml(icon)}" alt="" width="52" height="52" loading="lazy" decoding="async" />`
    : `<span class="cai-card__logo cai-card__logo--missing" aria-hidden="true"></span>`;

  return `<article class="cai-card" data-cai-card data-cai-cat="${escapeHtml(svc.category)}" data-cai-id="${escapeHtml(svc.id)}" data-ai-reveal>
  <div class="cai-card__top">
    ${img}
    <div class="cai-card__id">
      <h3 class="cai-card__name">${escapeHtml(svc.name)}</h3>
      <p class="cai-card__type">${escapeHtml(svc.type === "game" ? "GAME" : svc.type === "hub" ? "HUB" : "APP")} AI</p>
    </div>
  </div>
  <h4 class="cai-card__title">${escapeHtml(L.title)}</h4>
  <ul class="cai-card__feats">${feats}</ul>
  <button type="button" class="cai-card__cta" data-cai-open="${escapeHtml(svc.id)}">${escapeHtml(ui.detailCta)}</button>
</article>`;
}

function detailHtml(svc, app, ui, lang) {
  const L = localizeService(svc, lang);
  const icon = logoExists(svc.icon) ? svc.icon : "";
  const img = icon
    ? `<img class="cai-detail__logo" src="${escapeHtml(icon)}" alt="" width="64" height="64" loading="lazy" decoding="async" />`
    : "";

  const featureList = (L.features || [])
    .map(
      (f, i) => `<li class="cai-detail__feat">
      <div class="cai-detail__feat-head">
        <span class="cai-detail__feat-n">${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(f.title)}</strong>
        ${statusChip(ui, f.status)}
      </div>
      <p>${escapeHtml(f.body)}</p>
    </li>`
    )
    .join("");

  const detailHref =
    svc.type === "game"
      ? `../${svc.portfolio}`
      : `../${svc.portfolio}`;
  const detailLabel = svc.type === "game" ? ui.gameDetail : ui.appDetail;

  const play =
    svc.type === "game" && svc.playHref
      ? `<a class="btn btn-primary" href="${escapeHtml(svc.playHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ui.playGame)}</a>`
      : "";

  const stores = storeButtons(app, ui);

  return `<section class="cai-detail" id="cai-${escapeHtml(svc.id)}" data-cai-detail="${escapeHtml(svc.id)}" hidden>
  <div class="cai-detail__inner">
    <header class="cai-detail__head">
      ${img}
      <div>
        <p class="cai-detail__eyebrow">${escapeHtml(svc.name)} AI</p>
        <h3 class="cai-detail__title">${escapeHtml(L.title)}</h3>
        <p class="cai-detail__intro">${escapeHtml(L.intro)}</p>
      </div>
      <button type="button" class="cai-detail__close" data-cai-close aria-label="${escapeHtml(ui.detailClose)}">×</button>
    </header>
    ${L.notice ? `<p class="cai-detail__notice">${escapeHtml(L.notice)}</p>` : ""}
    <div class="cai-detail__example">
      <p class="cai-detail__label">${escapeHtml(ui.exampleLabel)}</p>
      <p class="cai-detail__q">“${escapeHtml(L.exampleQ)}”</p>
      <p class="cai-detail__a">${escapeHtml(L.exampleA)}</p>
    </div>
    <p class="cai-detail__label">${escapeHtml(ui.featuresLabel)} · ${escapeHtml(ui.statusLegend)}</p>
    <ol class="cai-detail__feats">${featureList}</ol>
    <div class="cai-detail__actions">
      <a class="btn btn-ghost" href="${escapeHtml(detailHref)}">${escapeHtml(detailLabel)} →</a>
      ${play}
      ${stores}
    </div>
  </div>
</section>`;
}

function finaleSection(flat, flatEn) {
  const cards = [
    {
      n: "01",
      href: "#cai-services",
      title: t(flat, flatEn, "studio.aiFinaleCta1Title", "AI 제품 살펴보기"),
      desc: t(flat, flatEn, "studio.aiFinaleCta1Desc", "Newon이 개발하는 AI 기반 제품과 서비스를 확인하세요."),
    },
    {
      n: "02",
      href: "../business/ai-automation/",
      title: t(flat, flatEn, "studio.aiFinaleCta2Title", "비즈니스를 위한 AI"),
      desc: t(flat, flatEn, "studio.aiFinaleCta2Desc", "기업의 업무와 제품에 적용할 수 있는 AI 기술과 솔루션을 살펴보세요."),
    },
    {
      n: "03",
      href: "../business/inquiry/",
      title: t(flat, flatEn, "studio.aiFinaleCta3Title", "AI 개발 및 협업 문의"),
      desc: t(flat, flatEn, "studio.aiFinaleCta3Desc", "AI 제품 개발과 기술 협업에 관한 문의를 남겨보세요."),
    },
  ]
    .map(
      (c) => `<a class="cai-close__btn${c.n === "01" ? " cai-close__btn--primary" : " cai-close__btn--ghost"}" href="${c.href}" data-cai-scroll>${c.title}</a>`
    )
    .join("");

  return `<section class="cai-close" id="cai-next" data-ai-reveal>
    <div class="hub-inner cai-close__shell">
      <p class="cai-close__eyebrow">${t(flat, flatEn, "studio.aiFinaleLabel", "THE NEXT EXPERIENCE · NEWON AI")}</p>
      <h2 class="cai-close__title">${t(flat, flatEn, "studio.aiFinaleTitle", "AI의 다음 가능성,\nNewon에서.").replace(/\n/g, "<br />")}</h2>
      <p class="cai-close__lead">${t(flat, flatEn, "studio.aiFinaleLead", "개인의 일상부터 새로운 제품과 비즈니스까지.\nNewon은 AI가 실제 경험으로 이어지는 미래를 만들어 갑니다.").replace(/\n/g, "<br />")}</p>
      <div class="cai-close__actions">${cards}</div>
    </div>
  </section>`;
}

export function renderAiShowcaseBody(flat, flatEn, lang) {
  const langDir = typeof lang === "string" ? lang : lang?.dir || "en";
  const copyLang = langDir === "ko" ? "ko" : "en";
  const ui = caiCopy(copyLang);
  // Prefer localized SEO/hero strings from locales when present
  ui.eyebrow = String(pick(flat, flatEn, "studio.aiHeroLabel") || ui.eyebrow);
  ui.title = String(pick(flat, flatEn, "studio.aiHeroTitle") || ui.title);
  ui.lead = String(pick(flat, flatEn, "studio.aiHeroLead") || ui.lead);
  ui.meta = String(pick(flat, flatEn, "studio.caiMeta") || ui.meta);
  ui.detailCta = String(pick(flat, flatEn, "studio.caiDetailCta") || ui.detailCta);
  ui.appDetail = String(pick(flat, flatEn, "studio.caiAppDetail") || ui.appDetail);
  ui.gameDetail = String(pick(flat, flatEn, "studio.caiGameDetail") || ui.gameDetail);
  ui.download = String(pick(flat, flatEn, "studio.caiDownload") || ui.download);
  ui.playGame = String(pick(flat, flatEn, "studio.caiPlay") || ui.playGame);
  ui.available = String(pick(flat, flatEn, "studio.caiAvailable") || ui.available);
  ui.planned = String(pick(flat, flatEn, "studio.caiPlanned") || ui.planned);

  const apps = loadPortfolioApps(copyLang);
  const bySlug = Object.fromEntries(apps.map((a) => [a.slug, a]));

  const missing = CAI_SERVICES.filter((s) => !logoExists(s.icon)).map((s) => s.name);
  if (missing.length) {
    console.warn("consumer-ai: missing logos:", missing.join(", "));
  }

  const cards = CAI_SERVICES.map((svc) => cardHtml(svc, bySlug[svc.slug], ui, copyLang)).join("\n");
  const details = CAI_SERVICES.map((svc) => detailHtml(svc, bySlug[svc.slug], ui, copyLang)).join("\n");

  const leadHtml = t(flat, flatEn, "studio.aiHeroLead", ui.lead).replace(/\n/g, "<br />");
  const titleHtml = t(flat, flatEn, "studio.aiHeroTitle", ui.title).replace(/\n/g, "<br />");

  return `<div class="ai-page cai-page" data-ai-page data-cai-page>
  <section class="cai-hero cai-hero--edit" data-ai-reveal>
    <div class="hub-inner cai-hero__grid">
      <div class="cai-hero__copy">
        <p class="cai-hero__eyebrow">${t(flat, flatEn, "studio.aiHeroLabel", "NEWON AI / INTELLIGENCE IN ACTION")}</p>
        <h1 class="cai-hero__title">${titleHtml}</h1>
        <p class="cai-hero__lead">${leadHtml}</p>
        <div class="cai-hero__actions">
          <a class="cai-btn cai-btn--primary" href="#cai-services" data-cai-scroll>${t(flat, flatEn, "studio.aiHeroCtaProducts", "AI 제품 살펴보기")} ↓</a>
          <a class="cai-btn cai-btn--ghost" href="../business/ai-automation/">${t(flat, flatEn, "studio.aiHeroCtaTech", "AI 기술 알아보기")} ↗</a>
        </div>
      </div>
      <aside class="cai-hero__visual" aria-hidden="true">
        <p class="cai-mark">
          <span class="cai-mark__line">AI</span>
          <span class="cai-mark__dot"></span>
          <span class="cai-mark__line">NEWON</span>
        </p>
      </aside>
    </div>
  </section>

  <section class="cai-catalog" id="cai-services">
    <div class="hub-inner">
      ${filterBar(ui, flat, flatEn)}
      <div class="cai-grid" data-cai-grid aria-label="${escapeHtml(ui.gridAria)}">
        ${cards}
      </div>
      <div class="cai-details" data-cai-details>
        ${details}
      </div>
    </div>
  </section>

  ${finaleSection(flat, flatEn)}
</div>`;
}
