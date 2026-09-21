/**
 * Consumer /saas/ — Newon+ subscription packages (not Review/QR/Link/Form).
 */
import { escapeHtml, pick } from "./hub-utils.mjs";
import { APP_CATALOG } from "./portfolio-data.mjs";
import { APPS_SHOWCASE_META } from "./apps-showcase-data.mjs";
import {
  PLUS_PACKAGES,
  PLUS_SUBSCRIBE_PLAY,
  PLUS_DETAIL_HREF,
  PLUS_HOME_HREF,
  PLUS_MEMBER_APPS,
} from "./newon-plus-packages.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

function tRaw(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return v != null && v !== "" ? String(v) : fb;
}

function isKoLang(lang) {
  const dir = typeof lang === "string" ? lang : lang?.dir || "en";
  return dir === "ko";
}

function appBySlug(slug) {
  return APP_CATALOG.find((a) => a.slug === slug);
}

function appMeta(slug, ko) {
  const entry = appBySlug(slug);
  const meta = APPS_SHOWCASE_META[slug] || {};
  return {
    slug,
    name: entry?.name || slug,
    icon: entry?.icon || "",
    href: `../portfolio/${slug}/`,
    tagline: ko ? meta.taglineKo || "" : meta.taglineEn || "",
    features: (ko ? meta.featuresKo : meta.featuresEn) || [],
  };
}

function packCopy(flat, flatEn, id, field, fb = "") {
  return t(flat, flatEn, `studio.plusPack_${id}_${field}`, fb);
}

function logoChip(app) {
  const img = app.icon
    ? `<img src="${escapeHtml(app.icon)}" alt="" width="36" height="36" loading="lazy" decoding="async" />`
    : "";
  return `<a class="plus-logo" href="${escapeHtml(app.href)}" title="${escapeHtml(app.name)}">
    ${img}
    <span>${escapeHtml(app.name)}</span>
  </a>`;
}

function priceBlock(flat, flatEn, pack) {
  const monthly = pack.priceMonthly;
  const yearly = pack.priceYearly;
  const inApp = t(flat, flatEn, "studio.plusPriceInApp", "가격은 Newon+ 앱에서 확인할 수 있습니다.");
  if (!monthly && !yearly) {
    return `<p class="plus-price plus-price--pending">${inApp}</p>`;
  }
  return `<dl class="plus-price">
    ${monthly ? `<div><dt>${t(flat, flatEn, "studio.plusMonthly", "월간")}</dt><dd>${escapeHtml(monthly)}</dd></div>` : ""}
    ${yearly ? `<div><dt>${t(flat, flatEn, "studio.plusYearly", "연간")}</dt><dd>${escapeHtml(yearly)}</dd></div>` : ""}
  </dl>`;
}

function heroLogos(ko) {
  const seen = new Set();
  const chips = [];
  for (const slug of ["newon-plus", ...PLUS_MEMBER_APPS]) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    chips.push(logoChip(appMeta(slug, ko)));
  }
  return `<div class="plus-hero__logos" aria-label="Newon apps">${chips.join("")}</div>`;
}

function packCard(pack, flat, flatEn, ko) {
  const apps = pack.apps.map((s) => appMeta(s, ko));
  const uses = tRaw(flat, flatEn, `studio.plusPack_${pack.id}_use`, "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");
  return `<article class="plus-card" id="plus-${escapeHtml(pack.id)}" data-saas-reveal>
    <p class="plus-card__n">${pack.n}</p>
    <h3 class="plus-card__name">${packCopy(flat, flatEn, pack.id, "name")}</h3>
    <p class="plus-card__lead">${packCopy(flat, flatEn, pack.id, "lead")}</p>
    <div class="plus-card__apps">${apps.map(logoChip).join("")}</div>
    ${uses ? `<ul class="plus-card__uses">${uses}</ul>` : ""}
    ${priceBlock(flat, flatEn, pack)}
    <div class="plus-card__actions">
      <button type="button" class="btn btn-ghost" data-plus-open="${escapeHtml(pack.id)}">${t(flat, flatEn, "studio.plusDetailCta", "자세히 보기")}</button>
      <a class="btn btn-primary" href="${PLUS_SUBSCRIBE_PLAY}" target="_blank" rel="noopener noreferrer">${t(flat, flatEn, "studio.plusSubscribeCta", "구독하기")}</a>
    </div>
  </article>`;
}

function packDetail(pack, flat, flatEn, ko) {
  const apps = pack.apps.map((s) => appMeta(s, ko));
  const appRows = apps
    .map((app) => {
      const feats = app.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("");
      return `<a class="plus-detail__app" href="${escapeHtml(app.href)}">
        ${app.icon ? `<img src="${escapeHtml(app.icon)}" alt="" width="44" height="44" loading="lazy" decoding="async" />` : ""}
        <div>
          <strong>${escapeHtml(app.name)}</strong>
          <p>${escapeHtml(app.tagline)}</p>
          ${feats ? `<ul>${feats}</ul>` : ""}
        </div>
      </a>`;
    })
    .join("");
  const together = tRaw(flat, flatEn, `studio.plusPack_${pack.id}_together`, "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");
  const perks = tRaw(flat, flatEn, "studio.plusPerks", "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  return `<section class="plus-detail" id="plus-detail-${escapeHtml(pack.id)}" data-plus-detail="${escapeHtml(pack.id)}" hidden>
    <div class="plus-detail__inner">
      <header class="plus-detail__head">
        <p class="plus-detail__eyebrow">${pack.n} · ${t(flat, flatEn, "studio.plusDetailLabel", "패키지 상세")}</p>
        <h3>${packCopy(flat, flatEn, pack.id, "name")}</h3>
        <p>${packCopy(flat, flatEn, pack.id, "purpose")}</p>
        <button type="button" class="plus-detail__close" data-plus-close aria-label="${t(flat, flatEn, "studio.plusClose", "닫기")}">×</button>
      </header>
      <div class="plus-detail__apps">${appRows}</div>
      ${together ? `<div class="plus-detail__block"><h4>${t(flat, flatEn, "studio.plusTogetherTitle", "함께 활용하는 방법")}</h4><ul>${together}</ul></div>` : ""}
      ${perks ? `<div class="plus-detail__block"><h4>${t(flat, flatEn, "studio.plusPerksTitle", "구독 혜택")}</h4><ul>${perks}</ul></div>` : ""}
      ${priceBlock(flat, flatEn, pack)}
      <div class="plus-detail__actions">
        <a class="btn btn-primary" href="${PLUS_SUBSCRIBE_PLAY}" target="_blank" rel="noopener noreferrer">${t(flat, flatEn, "studio.plusSubscribeCta", "구독하기")}</a>
        <a class="btn btn-ghost" href="${PLUS_DETAIL_HREF}">${t(flat, flatEn, "studio.plusLearnCta", "Newon+ 알아보기")}</a>
      </div>
    </div>
  </section>`;
}

function compareTable(flat, flatEn, ko) {
  const rows = PLUS_PACKAGES.map((pack) => {
    const names = pack.apps.map((s) => escapeHtml(appMeta(s, ko).name)).join(", ");
    const price = pack.priceMonthly || pack.priceYearly
      ? `${escapeHtml(pack.priceMonthly || "—")} / ${escapeHtml(pack.priceYearly || "—")}`
      : t(flat, flatEn, "studio.plusPriceInAppShort", "앱에서 확인");
    return `<tr>
      <th scope="row">${packCopy(flat, flatEn, pack.id, "name")}</th>
      <td>${pack.apps.length}</td>
      <td>${names}</td>
      <td>${price}</td>
    </tr>`;
  }).join("");
  return `<div class="plus-table-wrap">
    <table class="plus-table">
      <caption class="visually-hidden">${t(flat, flatEn, "studio.plusCompareCaption", "Newon+ 패키지 비교")}</caption>
      <thead>
        <tr>
          <th>${t(flat, flatEn, "studio.plusColPackage", "패키지")}</th>
          <th>${t(flat, flatEn, "studio.plusColCount", "앱")}</th>
          <th>${t(flat, flatEn, "studio.plusColApps", "포함 앱")}</th>
          <th>${t(flat, flatEn, "studio.plusColPrice", "요금")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

export function renderSaasShowcaseBody(flat, flatEn, lang) {
  const ko = isKoLang(lang);
  const titleHtml = t(flat, flatEn, "studio.plusHeroTitle", "나에게 필요한 앱을,\n하나의 패키지로.").replace(/\n/g, "<br />");
  const leadHtml = t(flat, flatEn, "studio.plusHeroLead", "금융부터 생산성, 건강과 가족까지.\n일상의 목적에 맞게 구성된 Newon의 구독 패키지를 만나보세요.").replace(/\n/g, "<br />");
  const cards = PLUS_PACKAGES.map((p) => packCard(p, flat, flatEn, ko)).join("\n");
  const details = PLUS_PACKAGES.map((p) => packDetail(p, flat, flatEn, ko)).join("\n");
  const plusFeats = tRaw(flat, flatEn, "studio.plusHubFeats", "")
    .split("\n")
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");

  return `<div class="saas-page plus-page" data-saas-page data-plus-page>
  <section class="plus-hero" data-saas-reveal>
    <div class="hub-inner plus-hero__inner">
      <p class="plus-hero__eyebrow">${t(flat, flatEn, "studio.plusHeroEyebrow", "NEWON CONSUMER · SAAS")}</p>
      <h1 class="plus-hero__title">${titleHtml}</h1>
      <p class="plus-hero__lead">${leadHtml}</p>
      <div class="plus-hero__actions">
        <a class="btn btn-primary" href="#plus-packages" data-plus-scroll>${t(flat, flatEn, "studio.plusHeroCtaPackages", "구독 패키지 둘러보기")}</a>
        <a class="btn btn-ghost" href="${PLUS_DETAIL_HREF}">${t(flat, flatEn, "studio.plusHeroCtaPlus", "Newon+ 알아보기")}</a>
      </div>
      ${heroLogos(ko)}
    </div>
  </section>

  <section class="plus-packages" id="plus-packages">
    <div class="hub-inner">
      <header class="plus-section-head" data-saas-reveal>
        <p class="plus-section-head__eyebrow">${t(flat, flatEn, "studio.plusPackagesEyebrow", "PACKAGES")}</p>
        <h2 class="plus-section-head__title">${t(flat, flatEn, "studio.plusPackagesTitle", "7개의 Newon+ 구독 패키지")}</h2>
        <p class="plus-section-head__lead">${t(flat, flatEn, "studio.plusPackagesLead", "목적에 맞는 앱을 묶어 구독할 수 있습니다.")}</p>
      </header>
      <div class="plus-grid">${cards}</div>
      <div class="plus-details">${details}</div>
    </div>
  </section>

  <section class="plus-compare" id="plus-compare" data-saas-reveal>
    <div class="hub-inner">
      <header class="plus-section-head">
        <p class="plus-section-head__eyebrow">${t(flat, flatEn, "studio.plusCompareEyebrow", "PRICING")}</p>
        <h2 class="plus-section-head__title">${t(flat, flatEn, "studio.plusCompareTitle", "패키지 한눈에 비교")}</h2>
        <p class="plus-section-head__lead">${t(flat, flatEn, "studio.plusCompareLead", "표시된 앱 구성은 Newon+에서 확인된 패키지 기준입니다. 판매 가격은 앱에서 확인할 수 있습니다.")}</p>
      </header>
      ${compareTable(flat, flatEn, ko)}
    </div>
  </section>

  <section class="plus-hub" id="plus-hub" data-saas-reveal>
    <div class="hub-inner plus-hub__inner">
      <p class="plus-hero__eyebrow">NEWON+</p>
      <h2 class="plus-hub__title">${t(flat, flatEn, "studio.plusHubTitle", "하나의 계정으로 연결되는 일상, Newon+")}</h2>
      <p class="plus-hub__lead">${t(flat, flatEn, "studio.plusHubLead", "Newon+는 다양한 Newon 생활 앱을 하나의 계정으로 이용하고, 필요한 구독 패키지를 관리할 수 있도록 연결하는 통합 플랫폼입니다.")}</p>
      ${plusFeats ? `<ul class="plus-hub__feats">${plusFeats}</ul>` : ""}
      <div class="plus-hero__actions">
        <a class="btn btn-primary" href="${PLUS_SUBSCRIBE_PLAY}" target="_blank" rel="noopener noreferrer">${t(flat, flatEn, "studio.plusSubscribeCta", "구독하기")}</a>
        <a class="btn btn-ghost" href="${PLUS_HOME_HREF}">${t(flat, flatEn, "studio.plusHeroCtaPlus", "Newon+ 알아보기")}</a>
      </div>
    </div>
  </section>
</div>`;
}
