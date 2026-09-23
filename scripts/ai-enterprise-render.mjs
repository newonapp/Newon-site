/**
 * Newon AI — Enterprise AI introduction.
 * Varied section layouts, shortened to the core message.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getAiEnterpriseCopy } from "./ai-enterprise-copy.mjs";
import { renderAiFilmHero } from "./ai-film-hero.mjs";

function nl(s) {
  return escapeHtml(String(s || "").replace(/<br\s*\/?>/gi, "\n")).replace(/\n/g, "<br />");
}

function sec(id, wash, kicker, title, lead, inner, note) {
  return `<section class="ent-sec${wash ? " ent-sec--wash" : ""}" id="${id}" data-ai-reveal>
    <div class="hub-inner">
      <header class="ent-head">
        <p class="ent-kicker">${escapeHtml(kicker || "")}</p>
        <h2 class="ent-title">${nl(title)}</h2>
        ${lead ? `<p class="ent-lead">${escapeHtml(lead)}</p>` : ""}
      </header>
      ${inner}
      ${note ? `<p class="ent-note">${escapeHtml(note)}</p>` : ""}
    </div>
  </section>`;
}

export function renderAiEnterpriseBody(flat, flatEn, lang) {
  const langDir = typeof lang === "string" ? lang : lang?.dir || "en";
  const ko = langDir === "ko";
  const c = getAiEnterpriseCopy(langDir);
  const inquiry = c.inquiryHref || "../../business/inquiry/";

  const meta = ko
    ? [
        ["상태", c.plannedFlag],
        ["방식", "실제 업무에 맞춘 구축"],
        ["전제", "중요한 결정은 담당자 승인"],
        ["비용", "범위 확인 후 안내"],
      ]
    : [
        ["Status", c.plannedFlag],
        ["Approach", "Built around real work"],
        ["Premise", "Sensitive decisions stay with a person"],
        ["Cost", "Quoted after the scope is clear"],
      ];

  const stack = `<aside class="ent-stack" aria-hidden="true">${(c.pillars.items || [])
    .map(
      (it, i) => `<div class="ent-stack__layer${i === 1 ? " is-on" : ""}">
        <span>${escapeHtml(it.n)} · ${escapeHtml(it.code)}</span>
        <strong>${escapeHtml(it.title)}</strong>
      </div>`
    )
    .join("")}</aside>`;

  const metaAside = `<aside class="ent-meta" aria-label="${ko ? "요약" : "Summary"}">${meta
    .map(
      ([k, v]) => `<div class="ent-meta__row"><p class="ent-meta__k">${escapeHtml(k)}</p><p class="ent-meta__v">${escapeHtml(v)}</p></div>`
    )
    .join("")}</aside>`;

  const directions = `<div class="ent-split">
      <div>
        <p class="ent-lead ent-lead--tight">${escapeHtml(c.pillars.lead || "")}</p>
      </div>
      ${metaAside}
    </div>
    <div class="ent-rows">${(c.pillars.items || [])
      .map(
        (it) => `<article class="ent-row">
          <p class="ent-row__n">${escapeHtml(it.n)}</p>
          <h3>${escapeHtml(it.code)}</h3>
          <div>
            <p class="ent-row__title">${escapeHtml(it.title)}</p>
            <p>${escapeHtml(it.body)}</p>
          </div>
        </article>`
      )
      .join("")}</div>`;

  const solutions = `<div class="ent-board">${(c.solutions.items || [])
    .map(
      (it) => `<article>
        <p class="ent-board__meta">${escapeHtml(it.n)} · ${escapeHtml(it.code)}</p>
        <h3>${escapeHtml(it.title)}</h3>
        <p>${escapeHtml(it.example)}</p>
      </article>`
    )
    .join("")}</div>`;

  const depts = `<ul class="ent-roster">${(c.depts.items || [])
    .map(
      (it) => `<li>
        <strong>${escapeHtml(it.name)}</strong>
        <p>${escapeHtml((it.tasks || []).join(ko ? " · " : " · "))}</p>
      </li>`
    )
    .join("")}</ul>`;

  const industries = `<div class="ent-pills">${(c.industries.items || [])
    .map(
      (it) => `<article>
        <h3>${escapeHtml(it.title)}</h3>
        <p>${escapeHtml(it.work)}</p>
      </article>`
    )
    .join("")}</div>`;

  const build = `<ol class="ent-levels">${(c.build.items || [])
    .map(
      (it) => `<li>
        <span>${escapeHtml(it.n)}</span>
        <div>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.target)}</p>
        </div>
      </li>`
    )
    .join("")}</ol>`;

  const process = `<ol class="ent-steps">${(c.process.items || [])
    .map(
      (it) => `<li>
        <span>${escapeHtml(it.n)}</span>
        <strong>${escapeHtml(it.code)}</strong>
        <p>${escapeHtml(it.title)}</p>
      </li>`
    )
    .join("")}</ol>`;

  const security = `<ul class="ent-checks">${(c.security.items || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;

  const models = `<div class="ent-scope">${(c.models.items || [])
    .map(
      (it) => `<article>
        <p>${escapeHtml(it.n)} · ${escapeHtml(it.type)}</p>
        <h3>${escapeHtml(it.title)}</h3>
        <p>${escapeHtml(it.body)}</p>
      </article>`
    )
    .join("")}</div>`;

  const business = `<div class="ent-flow">${(c.business.steps || [])
    .map(
      (step, i) =>
        `<p><span>${String(i + 1).padStart(2, "0")}</span>${escapeHtml(step)}</p>${i < c.business.steps.length - 1 ? `<span class="ent-flow__arrow" aria-hidden="true">→</span>` : ""}`
    )
    .join("")}</div>${c.business.link ? `<p class="ent-more"><a href="${escapeHtml(c.businessHref)}">${escapeHtml(c.business.link)} →</a></p>` : ""}`;

  const eco = `<ul class="ent-links">${(c.eco.items || [])
    .map(
      (it) => `<li><a href="${escapeHtml(it.href)}">${escapeHtml(it.name)}</a><p>${escapeHtml(it.body)}</p></li>`
    )
    .join("")}</ul>`;

  const roadmap = `<ol class="ent-rail">${(c.roadmap.items || [])
    .map(
      (it) => `<li>
        <span>${escapeHtml(it.n)}</span>
        <div>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.body)}</p>
        </div>
      </li>`
    )
    .join("")}</ol>`;

  return `<div class="ai-page cai-page cai-ent" data-ai-page>
  ${renderAiFilmHero("enterprise", langDir, {
    personal: c.personal,
    enterprise: c.enterprise,
    personalHref: "../#cai-hero",
    enterpriseHref: "#cai-hero",
  })}
  <section id="cai-hero" class="cai-hero cai-hero--edit" data-ai-reveal>
    <div class="hub-inner cai-hero__grid">
      <div class="cai-hero__copy">
        <p class="cai-hero__eyebrow">${escapeHtml(c.kicker)}</p>
        <h1 class="cai-hero__title">${nl(c.titleHtml)}</h1>
        <p class="cai-hero__lead">${escapeHtml(c.lead)}</p>
        <div class="cai-hero__actions">
          <a class="cai-btn cai-btn--primary" href="#cai-ent-solutions">${escapeHtml(c.ctaExplore)} ↓</a>
          <a class="cai-btn cai-btn--ghost" href="${escapeHtml(inquiry)}">${escapeHtml(c.ctaInquiry)} ↗</a>
        </div>
        <p class="cai-hero__meta">${escapeHtml(c.status)}</p>
      </div>
      ${stack}
    </div>
  </section>

  ${sec("cai-ent-why", true, c.pillars.kicker, c.pillars.title, "", directions, c.pillars.note)}
  ${sec("cai-ent-solutions", false, c.solutions.kicker, c.solutions.title, c.solutions.lead, solutions)}
  ${sec("cai-ent-depts", true, c.depts.kicker, c.depts.title, ko ? "부서마다 반복되는 일이 다릅니다." : "Each team repeats a different kind of work.", depts)}
  ${sec("cai-ent-industry", false, c.industries.kicker, c.industries.title, c.industries.lead, industries)}
  ${sec("cai-ent-arch", true, c.build.kicker, c.build.title, c.build.lead, build, c.build.note)}
  ${sec("cai-ent-process", false, c.process.kicker, c.process.title, ko ? "분석부터 적용, 개선까지 단계적으로 진행합니다." : "From understanding the work to rollout and improvement.", process)}
  ${sec("cai-ent-security", true, c.security.kicker, c.security.title, c.security.lead, security, c.security.note)}
  ${sec("cai-ent-model", false, c.models.kicker, c.models.title, c.models.lead, models)}
  ${sec("cai-ent-related", true, c.business.kicker, c.business.title, c.business.lead, business)}
  ${sec("cai-ent-roadmap", false, c.roadmap.kicker, c.roadmap.title, ko ? "출시 일정은 확정되지 않았습니다. 작은 업무 검증부터 확장합니다." : "No fixed launch date. Start by proving AI on a small type of work.", roadmap)}
  ${sec("cai-ent-scale", true, c.eco.kicker, c.eco.title, ko ? "아래 서비스와 지금 데이터가 연결되어 있지는 않습니다. 이후 확장 방향입니다." : "These services are not connected to Enterprise AI today. They are a later direction.", eco)}

  <section class="cai-close" id="cai-ent-next" data-ai-reveal>
    <div class="hub-inner cai-close__shell">
      <p class="cai-close__eyebrow">${escapeHtml(c.close.kicker)}</p>
      <h2 class="cai-close__title">${nl(c.close.title)}</h2>
      <p class="cai-close__lead">${escapeHtml(c.close.lead)}</p>
      ${c.close.note ? `<p class="cai-close__lead">${escapeHtml(c.close.note)}</p>` : ""}
      <div class="cai-close__actions">
        <a class="cai-close__btn cai-close__btn--primary" href="${escapeHtml(inquiry)}">${escapeHtml(c.ctaInquiryClose || c.ctaInquiry)}</a>
        <a class="cai-close__btn cai-close__btn--ghost" href="${escapeHtml(c.personalHref)}">${escapeHtml(c.ctaPersonal || c.personal)}</a>
      </div>
    </div>
  </section>
</div>`;
}
