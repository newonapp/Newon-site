/**
 * Homepage story visuals — 6 distinct compositions (landing-quality shell).
 * Each business gets a unique layout language, not the same list+aside pattern.
 */
import { escapeHtml } from "./hub-utils.mjs";

function panelShell({ mod, live, meta, body }) {
  return `<div class="hs-story-visual hs-story-visual--${escapeHtml(mod)}" aria-hidden="true">
  <div class="hs-sv">
    <div class="hs-sv__head">
      <span class="hs-sv__live"><i></i> ${escapeHtml(live)}</span>
      <span class="hs-sv__meta">${escapeHtml(meta)}</span>
    </div>
    <div class="hs-sv__body">${body}</div>
  </div>
</div>`;
}

/** 01 Consumer — phone + app dock (product ecosystem) */
export function visualConsumer(apps = []) {
  const dock = apps
    .slice(0, 8)
    .map(
      (p, i) =>
        `<a class="hs-sv-c__icon${i === 0 ? " is-on" : ""}" href="${escapeHtml(p.href)}" title="${escapeHtml(p.name)}">
          <img src="${escapeHtml(p.icon)}" alt="" width="36" height="36" loading="lazy" decoding="async" />
        </a>`
    )
    .join("");

  const screenApps = apps
    .slice(0, 6)
    .map(
      (p) =>
        `<div class="hs-sv-c__tile">
          <img src="${escapeHtml(p.icon)}" alt="" width="28" height="28" loading="lazy" decoding="async" />
          <span>${escapeHtml(p.name)}</span>
        </div>`
    )
    .join("");

  return panelShell({
    mod: "consumer",
    live: "LIFE APP HOME",
    meta: "LIVE",
    body: `
      <div class="hs-sv-c">
        <div class="hs-sv-c__phone">
          <span class="hs-sv-c__notch"></span>
          <div class="hs-sv-c__screen">
            <p class="hs-sv__k">TODAY</p>
            <div class="hs-sv-c__plus"><strong>Newon+</strong><em>One login</em></div>
            <div class="hs-sv-c__tiles">${screenApps}</div>
          </div>
        </div>
        <div class="hs-sv-c__side">
          <p class="hs-sv__k">ECOSYSTEM</p>
          <div class="hs-sv-c__dock">${dock}</div>
          <div class="hs-sv-c__meta">
            <div><span>Apps</span><strong>Live</strong></div>
            <div class="is-on"><span>Newon+</span><strong>Shared login</strong></div>
            <div><span>Focus</span><strong>Daily life</strong></div>
          </div>
        </div>
      </div>`,
  });
}

/** 02 AI — personal + business agent loop (layout unchanged, copy updated) */
export function visualAi(lang = "en") {
  const ko = lang === "ko";
  const cards = ko
    ? [
        {
          k: "PERSONAL AI",
          t: "일상과 목표를 이해하는 AI 비서",
          d: "Daily life · Goals · Planning",
          cls: "",
        },
        {
          k: "BUSINESS AI",
          t: "기업의 업무와 운영을 돕는 AI",
          d: "Workflow · Knowledge · Automation",
          cls: " is-on",
        },
        {
          k: "AI AGENT",
          t: "개인과 기업의 작업을 지원하는 AI Agent",
          d: "Research · Execute · Review",
          cls: " is-run",
        },
      ]
    : [
        {
          k: "PERSONAL AI",
          t: "AI assistant for daily life and goals",
          d: "Daily life · Goals · Planning",
          cls: "",
        },
        {
          k: "BUSINESS AI",
          t: "AI that supports business work and ops",
          d: "Workflow · Knowledge · Automation",
          cls: " is-on",
        },
        {
          k: "AI AGENT",
          t: "AI Agent for personal and business tasks",
          d: "Research · Execute · Review",
          cls: " is-run",
        },
      ];

  const cardHtml = cards
    .map(
      (c) =>
        `<article class="${c.cls.trim()}">
            <p class="hs-sv__k">${escapeHtml(c.k)}</p>
            <strong>${escapeHtml(c.t)}</strong>
            <em>${escapeHtml(c.d)}</em>
          </article>`
    )
    .join("");

  return panelShell({
    mod: "ai",
    live: "NEWON AI · AGENT SYSTEM",
    meta: "DESIGN",
    body: `
      <div class="hs-sv-a">
        <div class="hs-sv-a__rail">
          <span class="is-on">Understand</span><i></i>
          <span>Plan</span><i></i>
          <span>Assist</span><i></i>
          <span>Review</span>
        </div>
        <div class="hs-sv-a__grid">${cardHtml}</div>
        <div class="hs-sv-a__chips">
          <span class="is-on">Personal</span><span>Business</span><span>Agent</span><span>Automation</span>
        </div>
      </div>`,
  });
}

/** 03 Livon — horizontal journey timeline */
export function visualLifeStage() {
  return panelShell({
    mod: "life",
    live: "LIFE TIMELINE",
    meta: "DIRECTION",
    body: `
      <div class="hs-sv-l">
        <div class="hs-sv-l__track">
          <div class="hs-sv-l__line" aria-hidden="true"></div>
          <div class="hs-sv-l__node"><span>01</span><strong>Start</strong><em>Career</em></div>
          <div class="hs-sv-l__node"><span>02</span><strong>Grow</strong><em>Work</em></div>
          <div class="hs-sv-l__node is-on"><span>03</span><strong>Family</strong><em>Home</em></div>
          <div class="hs-sv-l__node"><span>04</span><strong>Raise</strong><em>Kids</em></div>
          <div class="hs-sv-l__node is-run"><span>05</span><strong>Later</strong><em>Support</em></div>
        </div>
        <div class="hs-sv-l__detail">
          <div class="hs-sv-l__card is-on">
            <p class="hs-sv__k">NOW</p>
            <strong>Family stage</strong>
            <em>Housing · care · planning</em>
          </div>
          <div class="hs-sv-l__card">
            <p class="hs-sv__k">CONNECT</p>
            <strong>Info → Service → Expert</strong>
            <em>When each stage needs help</em>
          </div>
        </div>
      </div>`,
  });
}

/** 04 Ongil — dual panes: senior living ↔ family link */
export function visualOngil() {
  return panelShell({
    mod: "ongil",
    live: "CARE CONNECTION",
    meta: "PLANNED",
    body: `
      <div class="hs-sv-o">
        <div class="hs-sv-o__pane">
          <p class="hs-sv__k">SENIOR</p>
          <div class="hs-sv-o__window">
            <div class="hs-sv-o__row is-on"><span>Daily living</span><em>Help</em></div>
            <div class="hs-sv-o__row"><span>Care search</span><em>Find</em></div>
            <div class="hs-sv-o__row"><span>Local info</span><em>Guide</em></div>
          </div>
        </div>
        <div class="hs-sv-o__bridge" aria-hidden="true">
          <i></i><span>Link</span><i></i>
        </div>
        <div class="hs-sv-o__pane is-family">
          <p class="hs-sv__k">FAMILY</p>
          <div class="hs-sv-o__device">
            <span class="hs-sv-o__notch"></span>
            <div class="hs-sv-o__screen">
              <p class="hs-sv__k">STATUS</p>
              <strong>Connected</strong>
              <em>Only with consent</em>
              <span class="hs-sv-o__cta">Check-in</span>
            </div>
          </div>
        </div>
      </div>`,
  });
}

/** 05 Business — browser workspace + service map */
export function visualBusiness() {
  return panelShell({
    mod: "business",
    live: "BUSINESS WORKSPACE",
    meta: "LIVE",
    body: `
      <div class="hs-sv-b">
        <div class="hs-sv-b__browser">
          <div class="hs-sv-b__chrome"><i></i><i></i><i></i><em>business.newon.app</em></div>
          <nav class="hs-sv-b__nav">
            <span class="is-on">Build</span><span>Automation</span><span>Research</span><span>Solutions</span>
          </nav>
          <div class="hs-sv-b__hero">
            <p class="hs-sv-b__brand">NEWON BUSINESS</p>
            <p class="hs-sv-b__tag">Ship products. Automate work. Grow with evidence.</p>
            <span class="hs-sv-b__cta">Start a project →</span>
          </div>
          <div class="hs-sv-b__blocks"><i class="is-on"></i><i></i><i></i></div>
        </div>
        <aside class="hs-sv-b__map">
          <p class="hs-sv__k">SERVICES</p>
          <ul>
            <li class="is-on"><span>01</span><strong>Build</strong></li>
            <li><span>02</span><strong>Automate</strong></li>
            <li><span>03</span><strong>Research</strong></li>
            <li class="is-run"><span>04</span><strong>Solutions</strong></li>
          </ul>
        </aside>
      </div>`,
  });
}

/** 06 Studio — identity board: type + swatches + craft lanes */
export function visualStudio() {
  return panelShell({
    mod: "studio",
    live: "STUDIO IDENTITY BOARD",
    meta: "LIVE",
    body: `
      <div class="hs-sv-s">
        <div class="hs-sv-s__specimen">
          <p class="hs-sv__k">TYPE</p>
          <p class="hs-sv-s__Aa">Aa</p>
          <p class="hs-sv-s__word">NEWON</p>
          <div class="hs-sv-s__swatches">
            <span class="is-ink"></span><span class="is-mid"></span><span class="is-soft"></span><span class="is-paper"></span>
          </div>
        </div>
        <div class="hs-sv-s__lanes">
          <div class="is-on"><span>01</span><strong>Brand</strong><em>System</em></div>
          <div><span>02</span><strong>Digital</strong><em>Web · App</em></div>
          <div><span>03</span><strong>Content</strong><em>Campaign</em></div>
          <div class="is-run"><span>04</span><strong>IP</strong><em>Experiment</em></div>
        </div>
      </div>`,
  });
}
