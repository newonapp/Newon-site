/**
 * Business service detail hero visuals — Studio-quality bs-sv panels.
 * One unique editorial panel per service visual key.
 */

function panelShell({ mod, live, meta, body }) {
  return `<div class="bs-visual bs-visual--studio bs-visual--biz-${mod}" aria-hidden="true">
  <div class="bs-sv">
    <div class="bs-sv__head">
      <span class="bs-sv__live"><i></i> ${live}</span>
      <span class="bs-sv__meta">${meta}</span>
    </div>
    <div class="bs-sv__body">${body}</div>
  </div>
</div>`;
}

function visualMvp() {
  return panelShell({
    mod: "mvp",
    live: "MVP BUILD PIPELINE",
    meta: "BUILD",
    body: `
      <div class="bs-sv-biz-mvp">
        <ol class="bs-sv-biz-mvp__steps">
          <li><span>01</span><strong>IDEA</strong></li>
          <li><span>02</span><strong>DEFINE</strong></li>
          <li><span>03</span><strong>DESIGN</strong></li>
          <li class="is-on"><span>04</span><strong>BUILD</strong></li>
          <li><span>05</span><strong>TEST</strong></li>
          <li><span>06</span><strong>LAUNCH</strong></li>
        </ol>
        <aside class="bs-sv-biz-mvp__status">
          <p class="bs-sv__k">PROJECT STATUS</p>
          <div class="bs-sv-biz-mvp__rows">
            <div><span>STAGE</span><strong>BUILD</strong></div>
            <div><span>SCOPE</span><strong>CORE ONLY</strong></div>
            <div><span>NEXT</span><strong>QA TEST</strong></div>
          </div>
        </aside>
      </div>`,
  });
}

function visualWeb() {
  return panelShell({
    mod: "web",
    live: "SITE STRUCTURE",
    meta: "WEB",
    body: `
      <div class="bs-sv-biz-web">
        <nav class="bs-sv-biz-web__nav">
          <span class="is-on">Home</span><span>About</span><span>Work</span><span>Contact</span>
        </nav>
        <div class="bs-sv-biz-web__hero">
          <p class="bs-sv-biz-web__brand">YOUR BRAND</p>
          <p class="bs-sv-biz-web__tag">Build a site people trust and use.</p>
          <span class="bs-sv-biz-web__cta">Get started →</span>
        </div>
        <div class="bs-sv-biz-web__metrics">
          <div><span>STRUCTURE</span><strong>CLEAR</strong></div>
          <div><span>RESPONSIVE</span><strong>READY</strong></div>
          <div class="is-on"><span>CTA</span><strong>WIRED</strong></div>
        </div>
      </div>`,
  });
}

function visualLanding() {
  return panelShell({
    mod: "landing",
    live: "LANDING FLOW",
    meta: "CONVERT",
    body: `
      <div class="bs-sv-biz-lp">
        <div class="bs-sv-biz-lp__page">
          <section class="is-on"><span>HERO</span><em>Hook</em></section>
          <section><span>VALUE</span><em>Proof</em></section>
          <section><span>PROOF</span><em>Trust</em></section>
          <section class="is-run"><span>CTA</span><em>Convert</em></section>
        </div>
        <aside class="bs-sv-biz-lp__funnel">
          <p class="bs-sv__k">CONVERSION</p>
          <div><span>Visit</span><strong>100%</strong></div>
          <div><span>Scroll</span><strong>72%</strong></div>
          <div class="is-on"><span>Click</span><strong>18%</strong></div>
        </aside>
      </div>`,
  });
}

function visualApp() {
  return panelShell({
    mod: "app",
    live: "APP PROTOTYPE",
    meta: "MOBILE",
    body: `
      <div class="bs-sv-biz-app">
        <div class="bs-sv-biz-app__phone">
          <span class="bs-sv-biz-app__notch"></span>
          <div class="bs-sv-biz-app__screen">
            <p class="bs-sv__k">CORE FLOW</p>
            <div class="bs-sv-biz-app__flow">
              <span class="is-on">Onboard</span><i></i><span>Home</span><i></i><span>Action</span>
            </div>
            <div class="bs-sv-biz-app__wire"><i></i><i></i><i class="is-on"></i></div>
          </div>
        </div>
        <div class="bs-sv-biz-app__tags"><span class="is-on">iOS</span><span class="is-on">Android</span><span>API</span></div>
      </div>`,
  });
}

function visualAi() {
  return panelShell({
    mod: "ai",
    live: "AI WORKFLOW",
    meta: "AUTOMATION",
    body: `
      <div class="bs-sv-biz-ai">
        <div class="bs-sv-biz-ai__rail">
          <span>INPUT</span><i></i><span class="is-on">CLASSIFY</span><i></i><span>ROUTE</span><i></i><span>ACTION</span>
        </div>
        <div class="bs-sv-biz-ai__out">
          <div class="is-run"><span>AI</span><strong>92%</strong><em>Confidence</em></div>
          <div class="is-on"><span>HITL</span><strong>Review</strong><em>Pending</em></div>
          <div><span>OUT</span><strong>Queued</strong><em>Action</em></div>
        </div>
      </div>`,
  });
}

function visualDataReport() {
  return panelShell({
    mod: "data",
    live: "REPORT DASHBOARD",
    meta: "DATA",
    body: `
      <div class="bs-sv-biz-data">
        <div class="bs-sv-biz-data__kpis">
          <div class="is-on"><span>REVENUE</span><strong>↑ 12%</strong></div>
          <div><span>USERS</span><strong>4.2K</strong></div>
          <div><span>RETENTION</span><strong>68%</strong></div>
        </div>
        <div class="bs-sv-biz-data__chart">
          <i style="height:45%"></i><i style="height:62%"></i><i style="height:78%"></i><i class="is-on" style="height:92%"></i>
        </div>
        <div class="bs-sv-biz-data__filters"><span class="is-on">Weekly</span><span>Monthly</span><span>Export</span></div>
      </div>`,
  });
}

function visualWorkflowAuto() {
  return panelShell({
    mod: "workflow",
    live: "WORKFLOW ENGINE",
    meta: "AUTOMATION",
    body: `
      <div class="bs-sv-biz-wf">
        <ol class="bs-sv-biz-wf__steps">
          <li><span>01</span><strong>Trigger</strong></li>
          <li><span>02</span><strong>Condition</strong></li>
          <li class="is-on"><span>03</span><strong>Action</strong></li>
          <li><span>04</span><strong>Notify</strong></li>
        </ol>
        <div class="bs-sv-biz-wf__queue">
          <p class="bs-sv__k">QUEUE</p>
          <div class="is-run"><span>Route owner</span><em>Running</em></div>
          <div><span>Send confirmation</span><em>Queued</em></div>
        </div>
      </div>`,
  });
}

function visualTools() {
  return panelShell({
    mod: "tools",
    live: "INTERNAL TOOLS",
    meta: "OPS",
    body: `
      <div class="bs-sv-biz-tools">
        <div class="bs-sv-biz-tools__modules">
          <div class="is-on"><span>01</span><strong>Inbox</strong></div>
          <div><span>02</span><strong>Dashboard</strong></div>
          <div><span>03</span><strong>Admin</strong></div>
        </div>
        <div class="bs-sv-biz-tools__ticket">
          <p class="bs-sv__k">LATEST REQUEST</p>
          <strong>#128 Budget approval</strong><em>Review · 2h ago</em>
        </div>
      </div>`,
  });
}

function visualMarketResearch() {
  return panelShell({
    mod: "market",
    live: "MARKET MAP",
    meta: "RESEARCH",
    body: `
      <div class="bs-sv-biz-mr">
        <div class="bs-sv-biz-mr__map">
          <span class="bs-sv-biz-mr__axis y">Premium</span>
          <span class="bs-sv-biz-mr__dot" style="left:28%;top:32%">A</span>
          <span class="bs-sv-biz-mr__dot" style="left:62%;top:24%">B</span>
          <span class="bs-sv-biz-mr__you" style="left:46%;top:48%">YOU</span>
        </div>
        <div class="bs-sv-biz-mr__out">
          <div><span>SEGMENTS</span><strong>4</strong></div>
          <div><span>GAPS</span><strong>2</strong></div>
          <div class="is-on"><span>OPPORTUNITY</span><strong>Clear</strong></div>
        </div>
      </div>`,
  });
}

function visualCompetitorAnalysis() {
  return panelShell({
    mod: "competitor",
    live: "COMPETITIVE MATRIX",
    meta: "ANALYSIS",
    body: `
      <div class="bs-sv-biz-ca">
        <div class="bs-sv-biz-ca__grid">
          <div class="bs-sv-biz-ca__head"><span></span><span>A</span><span>B</span><span>C</span></div>
          <div class="bs-sv-biz-ca__row"><span>Features</span><i class="is-y"></i><i class="is-y"></i><i class="is-p"></i></div>
          <div class="bs-sv-biz-ca__row"><span>Pricing</span><i class="is-p"></i><i class="is-y"></i><i class="is-y"></i></div>
          <div class="bs-sv-biz-ca__row"><span>Message</span><i class="is-y"></i><i class="is-p"></i><i class="is-n"></i></div>
        </div>
      </div>`,
  });
}

function visualConsumerResearch() {
  return panelShell({
    mod: "consumer",
    live: "USER SEGMENTS",
    meta: "RESEARCH",
    body: `
      <div class="bs-sv-biz-cr">
        <ul class="bs-sv-biz-cr__segments">
          <li class="is-on"><span>A</span><strong>Power users</strong><em>Speed · control</em></li>
          <li><span>B</span><strong>New adopters</strong><em>Onboarding</em></li>
          <li><span>C</span><strong>Price-sensitive</strong><em>Value</em></li>
        </ul>
        <div class="bs-sv-biz-cr__themes"><span class="is-on">Onboarding</span><span>Pricing</span><span>Support</span></div>
      </div>`,
  });
}

function visualUxAudit() {
  return panelShell({
    mod: "ux",
    live: "UX ISSUE BOARD",
    meta: "AUDIT",
    body: `
      <div class="bs-sv-biz-ux">
        <div class="bs-sv-biz-ux__row is-p1"><span>P1</span><strong>Checkout step unclear</strong><em>Checkout</em></div>
        <div class="bs-sv-biz-ux__row is-p2"><span>P2</span><strong>Form label mismatch</strong><em>Signup</em></div>
        <div class="bs-sv-biz-ux__row"><span>P3</span><strong>Empty state missing</strong><em>Dashboard</em></div>
        <div class="bs-sv-biz-ux__tags"><span class="is-on">Friction</span><span>IA</span><span>Quick win</span></div>
      </div>`,
  });
}

function visualTrendResearch() {
  return panelShell({
    mod: "trend",
    live: "TREND SIGNALS",
    meta: "RESEARCH",
    body: `
      <div class="bs-sv-biz-tr">
        <div class="bs-sv-biz-tr__row is-rising"><span>↑</span><strong>AI-assisted workflows</strong><em>Rising</em></div>
        <div class="bs-sv-biz-tr__row is-emerging"><span>◆</span><strong>Privacy-first UX</strong><em>Emerging</em></div>
        <div class="bs-sv-biz-tr__row"><span>—</span><strong>Subscription fatigue</strong><em>Stable</em></div>
      </div>`,
  });
}

function visualCustomProduct() {
  return panelShell({
    mod: "custom",
    live: "PRODUCT BLUEPRINT",
    meta: "SOLUTIONS",
    body: `
      <div class="bs-sv-biz-cp">
        <ol class="bs-sv-biz-cp__modules">
          <li class="is-on"><span>01</span><strong>Core workflow</strong><em>Phase 1</em></li>
          <li class="is-on"><span>02</span><strong>Admin console</strong><em>Phase 1</em></li>
          <li><span>03</span><strong>CRM sync</strong><em>Phase 2</em></li>
        </ol>
        <div class="bs-sv-biz-cp__layers"><span class="is-on">UX/UI</span><span>API</span><span class="is-on">Permissions</span></div>
      </div>`,
  });
}

function visualProductLaunch() {
  return panelShell({
    mod: "launch",
    live: "LAUNCH CHECKLIST",
    meta: "GO-TO-MARKET",
    body: `
      <div class="bs-sv-biz-pl">
        <div class="bs-sv-biz-pl__row is-done"><span>✓</span><strong>MVP core</strong><em>Product</em></div>
        <div class="bs-sv-biz-pl__row is-run"><span>◐</span><strong>Launch landing</strong><em>Landing</em></div>
        <div class="bs-sv-biz-pl__row"><span>○</span><strong>Analytics setup</strong><em>Ops</em></div>
      </div>`,
  });
}

function visualInternalSystem() {
  return panelShell({
    mod: "system",
    live: "OPS CONSOLE",
    meta: "INTERNAL",
    body: `
      <div class="bs-sv-biz-is">
        <div class="bs-sv-biz-is__row is-run"><span>#128</span><strong>Budget approval</strong><em>Review</em></div>
        <div class="bs-sv-biz-is__row is-on"><span>#127</span><strong>Asset request</strong><em>Pending</em></div>
        <div class="bs-sv-biz-is__row"><span>#126</span><strong>Vendor onboarding</strong><em>Done</em></div>
        <div class="bs-sv-biz-is__mods"><span class="is-on">Approval</span><span>Dashboard</span><span>Report</span></div>
      </div>`,
  });
}

function visualWhiteLabel() {
  return panelShell({
    mod: "whitelabel",
    live: "BRAND CONFIG",
    meta: "WHITE LABEL",
    body: `
      <div class="bs-sv-biz-wl">
        <div class="bs-sv-biz-wl__row"><span>Brand</span><strong>Your Brand</strong></div>
        <div class="bs-sv-biz-wl__row is-on"><span>Domain</span><strong>app.yourbrand.com</strong></div>
        <div class="bs-sv-biz-wl__row"><span>Modules</span><strong>6 active</strong></div>
        <div class="bs-sv-biz-wl__mods"><span class="is-on">Inbox</span><span>Booking</span><span class="is-on">Dashboard</span></div>
      </div>`,
  });
}

function visualDesign() {
  return panelShell({
    mod: "design",
    live: "DESIGN SYSTEM",
    meta: "STUDIO",
    body: `
      <div class="bs-sv-biz-ds">
        <div class="bs-sv-biz-ds__swatches"><i></i><i></i><i class="is-on"></i><i></i></div>
        <div class="bs-sv-biz-ds__type"><span>Aa</span><strong>Display</strong><em>Heading</em></div>
        <div class="bs-sv-biz-ds__comps"><span class="is-on">Button</span><span>Input</span><span>Card</span></div>
      </div>`,
  });
}

function visualPartnership() {
  return panelShell({
    mod: "partnership",
    live: "PARTNERSHIP MAP",
    meta: "COLLAB",
    body: `
      <div class="bs-sv-biz-part">
        <div class="bs-sv-biz-part__nodes">
          <span class="is-on">Brand</span><i></i><span>Newon</span><i></i><span class="is-on">Service</span>
        </div>
        <p class="bs-sv-biz-part__note">Long-term partnership · not one-off campaigns</p>
      </div>`,
  });
}

function visualCollabService() {
  return panelShell({
    mod: "collab",
    live: "SERVICE CONNECT",
    meta: "COLLAB",
    body: `
      <div class="bs-sv-biz-part">
        <div class="bs-sv-biz-part__nodes">
          <span class="is-on">App</span><i></i><span>API</span><i></i><span class="is-on">Content</span>
        </div>
        <p class="bs-sv-biz-part__note">Connect on live Newon products</p>
      </div>`,
  });
}

function visualPromotion() {
  return panelShell({
    mod: "promotion",
    live: "PROMO CHANNELS",
    meta: "MEDIA",
    body: `
      <div class="bs-sv-biz-promo">
        <div class="bs-sv-biz-promo__channels"><span class="is-on">In-app</span><span>Web</span><span>Email</span></div>
        <div class="bs-sv-biz-promo__principles">
          <span class="is-on">User-first</span><span>Relevant</span><span>Measured</span>
        </div>
      </div>`,
  });
}

function visualDevelopment() {
  return panelShell({
    mod: "development",
    live: "BUILD CHAIN",
    meta: "DEVELOPMENT",
    body: `
      <div class="bs-sv-biz-dev">
        <p class="bs-sv-biz-dev__chain">IDEA <i></i> PLAN <i></i> DESIGN <i></i> <strong class="is-on">BUILD</strong> <i></i> LAUNCH</p>
        <div class="bs-sv-biz-dev__status"><span>STAGE</span><strong>BUILD</strong></div>
      </div>`,
  });
}

function visualPipeline() {
  return visualMvp();
}

/** @param {string} visualKey — from business-service-catalog visual field */
export function businessHeroVisual(visualKey, slug = "") {
  const map = {
    mvp: visualMvp,
    web: visualWeb,
    "landing-page": visualLanding,
    "app-prototype": visualApp,
    "ai-automation": visualAi,
    "data-report": visualDataReport,
    "workflow-auto": visualWorkflowAuto,
    tools: visualTools,
    "market-research": visualMarketResearch,
    "competitor-analysis": visualCompetitorAnalysis,
    "consumer-research": visualConsumerResearch,
    "ux-audit": visualUxAudit,
    "trend-research": visualTrendResearch,
    "custom-product": visualCustomProduct,
    "product-launch": visualProductLaunch,
    "internal-system": visualInternalSystem,
    "white-label": visualWhiteLabel,
    design: visualDesign,
    pipeline: visualPipeline,
    browser: visualWeb,
    devices: visualApp,
    workflow: visualWorkflowAuto,
    system: visualInternalSystem,
    "brand-stack": visualDesign,
    partnership: visualPartnership,
    service: visualCollabService,
    promotion: visualPromotion,
    development: visualDevelopment,
  };
  const collabSlug = {
    partnership: visualPartnership,
    service: visualCollabService,
    promotion: visualPromotion,
    development: visualDevelopment,
  };
  const fn = collabSlug[slug] || map[visualKey] || map[slug];
  return fn ? fn() : visualMvp();
}
