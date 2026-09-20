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

function earlyAccessForm(flat, flatEn) {
  return `<section class="cai-more" id="ai-early-access" data-ai-reveal>
    <div class="cai-more__inner hub-inner">
      <div class="cai-more__copy">
        <p class="cai-more__eyebrow">${t(flat, flatEn, "studio.aiEarlyLabel", "NEWON AI / EARLY ACCESS")}</p>
        <h2 class="cai-more__title">${t(flat, flatEn, "studio.aiEarlyTitle", "Newon AI product updates")}</h2>
      </div>
      <form class="cai-more__form waitlist-form nw-notify-form" data-waitlist-form data-product-id="newon-ai" data-form-type="waitlist">
        <input type="hidden" name="productId" value="newon-ai" />
        <div class="nw-notify-form__row">
          <label class="nw-notify-form__field">
            <span class="visually-hidden">Email</span>
            <input type="email" name="email" class="nw-notify-form__email" placeholder="email@example.com" required autocomplete="email" aria-label="Email" />
          </label>
          <button type="submit" class="btn btn-primary nw-notify-form__btn">${t(flat, flatEn, "studio.aiEarlyCta", "Join waitlist")}</button>
        </div>
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
      </form>
      <p class="waitlist-success" data-waitlist-success hidden>${t(flat, flatEn, "studio.waitlistSuccess", "")}</p>
      <p class="waitlist-success" data-waitlist-duplicate hidden>${t(flat, flatEn, "studio.newsletterAlready", "")}</p>
      <p class="waitlist-error" data-waitlist-error hidden role="alert">${t(flat, flatEn, "studio.waitlistError", "")}</p>
      <p class="cai-more__links">
        <a href="../business/ai-automation/">${t(flat, flatEn, "studio.aiCta", "Business AI")} →</a>
        <a href="../business/inquiry/">${t(flat, flatEn, "nav.inquiry", "Inquiry")} →</a>
      </p>
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

  const leadHtml = escapeHtml(ui.lead).replace(/\n/g, "<br />");

  return `<div class="ai-page cai-page" data-ai-page data-cai-page>
  <section class="cai-hero" data-ai-reveal>
    <div class="cai-hero__inner hub-inner">
      <p class="cai-hero__eyebrow">${escapeHtml(ui.eyebrow)}</p>
      <h1 class="cai-hero__title">${escapeHtml(ui.title)}</h1>
      <p class="cai-hero__lead">${leadHtml}</p>
      <p class="cai-hero__meta">${escapeHtml(ui.meta)}</p>
      <div class="cai-hero__logos-wrap" aria-label="${escapeHtml(ui.logoMarqueeAria)}">
        ${heroLogos(CAI_SERVICES)}
      </div>
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

  ${earlyAccessForm(flat, flatEn)}
</div>`;
}
