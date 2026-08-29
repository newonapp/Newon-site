/**
 * Business service detail hero visuals — Studio-quality bs-sv panels.
 * Unique editorial composition per service keyword. No invented metrics.
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
    live: "MVP BUILD BOARD",
    meta: "BUILD",
    body: `
      <div class="bs-sv-biz-mvp">
        <div class="bs-sv-biz-mvp__stage">
          <div class="bs-sv-biz-mvp__phone">
            <span class="bs-sv-biz-mvp__notch"></span>
            <div class="bs-sv-biz-mvp__screen">
              <p class="bs-sv__k">CORE FLOW</p>
              <div class="bs-sv-biz-mvp__wire"><i class="is-on"></i><i></i><i></i></div>
              <div class="bs-sv-biz-mvp__wire is-soft"><i></i><i class="is-on"></i></div>
              <span class="bs-sv-biz-mvp__cta">Primary CTA</span>
            </div>
          </div>
          <ol class="bs-sv-biz-mvp__steps">
            <li><span>01</span><strong>IDEA</strong></li>
            <li><span>02</span><strong>DEFINE</strong></li>
            <li><span>03</span><strong>DESIGN</strong></li>
            <li class="is-on"><span>04</span><strong>BUILD</strong></li>
            <li><span>05</span><strong>TEST</strong></li>
            <li><span>06</span><strong>SHIP</strong></li>
          </ol>
        </div>
        <aside class="bs-sv-biz-mvp__aside">
          <p class="bs-sv__k">SCOPE</p>
          <div class="bs-sv-biz-mvp__chips"><span class="is-on">Core</span><span>Later</span><span>Cut</span></div>
          <p class="bs-sv__k">STATUS</p>
          <div class="bs-sv-biz-mvp__rows">
            <div><span>STAGE</span><strong>BUILD</strong></div>
            <div><span>FOCUS</span><strong>ONE FLOW</strong></div>
            <div class="is-on"><span>NEXT</span><strong>TEST</strong></div>
          </div>
        </aside>
      </div>`,
  });
}

function visualWeb() {
  return panelShell({
    mod: "web",
    live: "SITE ARCHITECTURE",
    meta: "WEB",
    body: `
      <div class="bs-sv-biz-web">
        <div class="bs-sv-biz-web__browser">
          <div class="bs-sv-biz-web__chrome"><i></i><i></i><i></i><em>yourbrand.com</em></div>
          <nav class="bs-sv-biz-web__nav">
            <span class="is-on">Home</span><span>About</span><span>Work</span><span>Contact</span>
          </nav>
          <div class="bs-sv-biz-web__hero">
            <p class="bs-sv-biz-web__brand">YOUR BRAND</p>
            <p class="bs-sv-biz-web__tag">Clear structure. Trust. Action.</p>
            <span class="bs-sv-biz-web__cta">Get started →</span>
          </div>
          <div class="bs-sv-biz-web__blocks"><i></i><i></i><i></i></div>
        </div>
        <aside class="bs-sv-biz-web__map">
          <p class="bs-sv__k">SITEMAP</p>
          <ul>
            <li class="is-on"><span>01</span><strong>Home</strong></li>
            <li><span>02</span><strong>About</strong></li>
            <li><span>03</span><strong>Services</strong></li>
            <li><span>04</span><strong>Contact</strong></li>
          </ul>
        </aside>
      </div>`,
  });
}

function visualLanding() {
  return panelShell({
    mod: "landing",
    live: "LANDING CONVERSION",
    meta: "CONVERT",
    body: `
      <div class="bs-sv-biz-lp">
        <div class="bs-sv-biz-lp__page">
          <section class="is-on"><span>01 HERO</span><em>Hook + CTA</em><b></b></section>
          <section><span>02 VALUE</span><em>Why it matters</em></section>
          <section><span>03 PROOF</span><em>Trust signals</em></section>
          <section class="is-run"><span>04 CTA</span><em>Convert</em><b></b></section>
        </div>
        <aside class="bs-sv-biz-lp__funnel">
          <p class="bs-sv__k">FLOW</p>
          <div class="bs-sv-biz-lp__bars">
            <div style="--w:100%"><span>Visit</span><i></i></div>
            <div style="--w:74%"><span>Scroll</span><i></i></div>
            <div class="is-on" style="--w:42%"><span>Engage</span><i></i></div>
            <div style="--w:18%"><span>Convert</span><i></i></div>
          </div>
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
        <div class="bs-sv-biz-app__phones">
          <div class="bs-sv-biz-app__phone is-back">
            <span class="bs-sv-biz-app__notch"></span>
            <div class="bs-sv-biz-app__screen">
              <div class="bs-sv-biz-app__wire"><i></i><i></i></div>
            </div>
          </div>
          <div class="bs-sv-biz-app__phone is-front">
            <span class="bs-sv-biz-app__notch"></span>
            <div class="bs-sv-biz-app__screen">
              <p class="bs-sv__k">CORE TASK</p>
              <div class="bs-sv-biz-app__flow">
                <span class="is-on">Onboard</span><i></i><span>Home</span><i></i><span>Action</span>
              </div>
              <div class="bs-sv-biz-app__wire"><i class="is-on"></i><i></i><i></i></div>
              <span class="bs-sv-biz-app__btn">Continue</span>
            </div>
          </div>
        </div>
        <div class="bs-sv-biz-app__tags">
          <span class="is-on">iOS</span><span class="is-on">Android</span><span>API</span><span>Push</span>
        </div>
      </div>`,
  });
}

function visualAi() {
  return panelShell({
    mod: "ai",
    live: "AI AUTOMATION LOOP",
    meta: "AUTOMATION",
    body: `
      <div class="bs-sv-biz-ai">
        <div class="bs-sv-biz-ai__rail">
          <span>INPUT</span><i></i><span class="is-on">CLASSIFY</span><i></i><span>DRAFT</span><i></i><span>REVIEW</span><i></i><span>ACTION</span>
        </div>
        <div class="bs-sv-biz-ai__grid">
          <article class="is-run">
            <p class="bs-sv__k">AI</p>
            <strong>Classify · Draft</strong>
            <em>Model proposes</em>
          </article>
          <article class="is-on">
            <p class="bs-sv__k">HUMAN</p>
            <strong>Approve · Edit</strong>
            <em>HITL gate</em>
          </article>
          <article>
            <p class="bs-sv__k">SYSTEM</p>
            <strong>Route · Log</strong>
            <em>Ops ready</em>
          </article>
        </div>
        <div class="bs-sv-biz-ai__modules">
          <span class="is-on">Inquiry</span><span>Reply</span><span>Summary</span><span>Knowledge</span>
        </div>
      </div>`,
  });
}

function visualDataReport() {
  return panelShell({
    mod: "data",
    live: "DATA REPORT BOARD",
    meta: "REPORTING",
    body: `
      <div class="bs-sv-biz-data">
        <div class="bs-sv-biz-data__kpis">
          <div class="is-on"><span>SIGNAL</span><strong>Primary</strong></div>
          <div><span>TREND</span><strong>Tracked</strong></div>
          <div><span>EXPORT</span><strong>Ready</strong></div>
        </div>
        <div class="bs-sv-biz-data__main">
          <div class="bs-sv-biz-data__chart">
            <i style="height:38%"></i><i style="height:52%"></i><i style="height:46%"></i>
            <i style="height:68%"></i><i style="height:74%"></i><i class="is-on" style="height:88%"></i>
          </div>
          <div class="bs-sv-biz-data__table">
            <div class="bs-sv-biz-data__tr is-head"><span>Metric</span><span>View</span></div>
            <div class="bs-sv-biz-data__tr"><span>Segment A</span><span class="is-on">Focus</span></div>
            <div class="bs-sv-biz-data__tr"><span>Segment B</span><span>Watch</span></div>
            <div class="bs-sv-biz-data__tr"><span>Segment C</span><span>Watch</span></div>
          </div>
        </div>
        <div class="bs-sv-biz-data__filters"><span class="is-on">Weekly</span><span>Monthly</span><span>Brief</span><span>Dashboard</span></div>
      </div>`,
  });
}

function visualWorkflowAuto() {
  return panelShell({
    mod: "workflow",
    live: "WORKFLOW GRAPH",
    meta: "AUTOMATION",
    body: `
      <div class="bs-sv-biz-wf">
        <div class="bs-sv-biz-wf__graph">
          <div class="bs-sv-biz-wf__node"><span>01</span><strong>Trigger</strong></div>
          <i class="bs-sv-biz-wf__edge"></i>
          <div class="bs-sv-biz-wf__node"><span>02</span><strong>Condition</strong></div>
          <i class="bs-sv-biz-wf__edge"></i>
          <div class="bs-sv-biz-wf__node is-on"><span>03</span><strong>Action</strong></div>
          <i class="bs-sv-biz-wf__edge"></i>
          <div class="bs-sv-biz-wf__node"><span>04</span><strong>Notify</strong></div>
        </div>
        <div class="bs-sv-biz-wf__queue">
          <p class="bs-sv__k">RUN QUEUE</p>
          <div class="is-run"><span>Route owner</span><em>Running</em></div>
          <div><span>Send confirmation</span><em>Queued</em></div>
          <div><span>Log event</span><em>Waiting</em></div>
        </div>
      </div>`,
  });
}

function visualTools() {
  return panelShell({
    mod: "tools",
    live: "INTERNAL TOOL CONSOLE",
    meta: "OPS",
    body: `
      <div class="bs-sv-biz-tools">
        <aside class="bs-sv-biz-tools__nav">
          <span class="is-on">Inbox</span><span>Dashboard</span><span>Admin</span><span>Report</span>
        </aside>
        <div class="bs-sv-biz-tools__main">
          <p class="bs-sv__k">REQUEST QUEUE</p>
          <div class="bs-sv-biz-tools__ticket is-on"><span>#128</span><strong>Budget approval</strong><em>Review</em></div>
          <div class="bs-sv-biz-tools__ticket"><span>#127</span><strong>Asset request</strong><em>Pending</em></div>
          <div class="bs-sv-biz-tools__ticket"><span>#126</span><strong>Vendor onboard</strong><em>Done</em></div>
          <div class="bs-sv-biz-tools__bar"><span class="is-on">Filter</span><span>Assign</span><span>Export</span></div>
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
          <span class="bs-sv-biz-mr__axis yb">Value</span>
          <span class="bs-sv-biz-mr__axis x">Niche</span>
          <span class="bs-sv-biz-mr__axis xr">Mass</span>
          <span class="bs-sv-biz-mr__zone"></span>
          <span class="bs-sv-biz-mr__dot" style="left:24%;top:28%">A</span>
          <span class="bs-sv-biz-mr__dot" style="left:68%;top:22%">B</span>
          <span class="bs-sv-biz-mr__dot" style="left:72%;top:62%">C</span>
          <span class="bs-sv-biz-mr__you" style="left:44%;top:46%">YOU</span>
        </div>
        <div class="bs-sv-biz-mr__out">
          <div><span>SEGMENTS</span><strong>Mapped</strong></div>
          <div><span>GAPS</span><strong>Found</strong></div>
          <div class="is-on"><span>FOCUS</span><strong>Defined</strong></div>
        </div>
      </div>`,
  });
}

function visualCompetitorAnalysis() {
  return panelShell({
    mod: "competitor",
    live: "COMPETITOR MATRIX",
    meta: "COMPARE",
    body: `
      <div class="bs-sv-biz-ca">
        <div class="bs-sv-biz-ca__grid">
          <div class="bs-sv-biz-ca__head"><span>AXIS</span><span>A</span><span>B</span><span>C</span><span>YOU</span></div>
          <div class="bs-sv-biz-ca__row"><span>Offer</span><i class="is-p"></i><i class="is-p"></i><i></i><i class="is-on"></i></div>
          <div class="bs-sv-biz-ca__row"><span>Pricing</span><i class="is-p"></i><i></i><i class="is-p"></i><i class="is-on"></i></div>
          <div class="bs-sv-biz-ca__row"><span>Message</span><i></i><i class="is-p"></i><i class="is-p"></i><i class="is-on"></i></div>
          <div class="bs-sv-biz-ca__row"><span>Channel</span><i class="is-p"></i><i class="is-p"></i><i></i><i class="is-p"></i></div>
        </div>
        <div class="bs-sv-biz-ca__note"><span class="is-on">Strength</span><span>Parity</span><span>Gap</span></div>
      </div>`,
  });
}

function visualConsumerResearch() {
  return panelShell({
    mod: "consumer",
    live: "CONSUMER JOURNEY",
    meta: "INSIGHT",
    body: `
      <div class="bs-sv-biz-cr">
        <div class="bs-sv-biz-cr__lanes">
          <div class="bs-sv-biz-cr__lane"><span>01 OBSERVE</span><em>What people do</em><b></b><b></b></div>
          <div class="bs-sv-biz-cr__lane"><span>02 FRICTION</span><em>Where it breaks</em><b class="is-on"></b><b></b></div>
          <div class="bs-sv-biz-cr__lane is-on"><span>03 INSIGHT</span><em>What it means</em><b></b><b class="is-on"></b></div>
          <div class="bs-sv-biz-cr__lane"><span>04 ACTION</span><em>What to build</em><b></b></div>
        </div>
        <div class="bs-sv-biz-cr__tags"><span class="is-on">Jobs</span><span>Pains</span><span>Gains</span><span>Quotes</span></div>
      </div>`,
  });
}

function visualUxAudit() {
  return panelShell({
    mod: "ux",
    live: "UX AUDIT BOARD",
    meta: "AUDIT",
    body: `
      <div class="bs-sv-biz-ux">
        <div class="bs-sv-biz-ux__flow">
          <span class="is-on">ENTRY</span><i></i><span>CORE</span><i></i><span>CONVERT</span><i></i><span>RETURN</span>
        </div>
        <div class="bs-sv-biz-ux__findings">
          <div class="bs-sv-biz-ux__row is-p1"><span>P1</span><strong>Critical friction</strong><em>Severity · Impact</em></div>
          <div class="bs-sv-biz-ux__row is-p2"><span>P2</span><strong>Flow confusion</strong><em>Severity · Impact</em></div>
          <div class="bs-sv-biz-ux__row"><span>P3</span><strong>Polish issue</strong><em>Severity · Impact</em></div>
        </div>
        <div class="bs-sv-biz-ux__tags"><span class="is-on">Heuristic</span><span>Task flow</span><span>Fix order</span></div>
      </div>`,
  });
}

function visualTrendResearch() {
  return panelShell({
    mod: "trend",
    live: "TREND WAVE",
    meta: "SIGNALS",
    body: `
      <div class="bs-sv-biz-tr">
        <div class="bs-sv-biz-tr__wave">
          <div class="bs-sv-biz-tr__row is-emerging"><span>EMERGING</span><strong>Watch</strong><i style="--w:28%"></i></div>
          <div class="bs-sv-biz-tr__row is-rising"><span>GROWING</span><strong>Track</strong><i style="--w:62%"></i></div>
          <div class="bs-sv-biz-tr__row is-on"><span>MAINSTREAM</span><strong>Adopt</strong><i style="--w:88%"></i></div>
          <div class="bs-sv-biz-tr__row"><span>DECLINING</span><strong>Exit</strong><i style="--w:18%"></i></div>
        </div>
        <div class="bs-sv-biz-tr__tags"><span class="is-on">Signal</span><span>Timing</span><span>Implication</span></div>
      </div>`,
  });
}

function visualCustomProduct() {
  return panelShell({
    mod: "custom",
    live: "PRODUCT BLUEPRINT",
    meta: "CUSTOM",
    body: `
      <div class="bs-sv-biz-cp">
        <div class="bs-sv-biz-cp__arch">
          <div class="bs-sv-biz-cp__layer is-on"><span>UX / UI</span></div>
          <div class="bs-sv-biz-cp__layer"><span>Workflow</span></div>
          <div class="bs-sv-biz-cp__layer is-on"><span>API · Data</span></div>
          <div class="bs-sv-biz-cp__layer"><span>Permissions</span></div>
        </div>
        <ol class="bs-sv-biz-cp__modules">
          <li class="is-on"><span>01</span><strong>Core workflow</strong><em>Phase 1</em></li>
          <li class="is-on"><span>02</span><strong>Admin console</strong><em>Phase 1</em></li>
          <li><span>03</span><strong>Integrations</strong><em>Phase 2</em></li>
          <li><span>04</span><strong>Reporting</strong><em>Phase 2</em></li>
        </ol>
      </div>`,
  });
}

function visualProductLaunch() {
  return panelShell({
    mod: "launch",
    live: "LAUNCH CONTROL",
    meta: "GO-TO-MARKET",
    body: `
      <div class="bs-sv-biz-pl">
        <div class="bs-sv-biz-pl__list">
          <div class="bs-sv-biz-pl__row is-done"><span>✓</span><strong>MVP core</strong><em>Product</em></div>
          <div class="bs-sv-biz-pl__row is-run"><span>●</span><strong>Launch landing</strong><em>Landing</em></div>
          <div class="bs-sv-biz-pl__row"><span>○</span><strong>Analytics</strong><em>Ops</em></div>
          <div class="bs-sv-biz-pl__row"><span>○</span><strong>Support ready</strong><em>Ops</em></div>
        </div>
        <aside class="bs-sv-biz-pl__channels">
          <p class="bs-sv__k">CHANNELS</p>
          <span class="is-on">Web</span><span>App</span><span>Email</span><span>Social</span>
        </aside>
      </div>`,
  });
}

function visualInternalSystem() {
  return panelShell({
    mod: "system",
    live: "INTERNAL SYSTEM",
    meta: "OPS",
    body: `
      <div class="bs-sv-biz-is">
        <div class="bs-sv-biz-is__top">
          <span class="is-on">Approvals</span><span>Dashboard</span><span>Directory</span><span>Reports</span>
        </div>
        <div class="bs-sv-biz-is__rows">
          <div class="bs-sv-biz-is__row is-run"><span>#128</span><strong>Budget approval</strong><em>Review</em></div>
          <div class="bs-sv-biz-is__row is-on"><span>#127</span><strong>Asset request</strong><em>Pending</em></div>
          <div class="bs-sv-biz-is__row"><span>#126</span><strong>Vendor onboard</strong><em>Done</em></div>
        </div>
        <div class="bs-sv-biz-is__mods"><span class="is-on">Roles</span><span>Workflow</span><span>Audit log</span></div>
      </div>`,
  });
}

function visualWhiteLabel() {
  return panelShell({
    mod: "whitelabel",
    live: "WHITE-LABEL STACK",
    meta: "BRAND LAYER",
    body: `
      <div class="bs-sv-biz-wl">
        <div class="bs-sv-biz-wl__stack">
          <div class="bs-sv-biz-wl__layer"><span>BASE PRODUCT</span><strong>Validated core</strong></div>
          <div class="bs-sv-biz-wl__layer is-on"><span>BRAND LAYER</span><strong>Your identity</strong></div>
          <div class="bs-sv-biz-wl__layer"><span>CONFIG</span><strong>Modules · Domain</strong></div>
        </div>
        <div class="bs-sv-biz-wl__cfg">
          <div class="bs-sv-biz-wl__row"><span>Brand</span><strong>Your Brand</strong></div>
          <div class="bs-sv-biz-wl__row is-on"><span>Domain</span><strong>app.yourbrand.com</strong></div>
          <div class="bs-sv-biz-wl__mods"><span class="is-on">Inbox</span><span>Booking</span><span class="is-on">Dashboard</span></div>
        </div>
      </div>`,
  });
}

function visualDesign() {
  return panelShell({
    mod: "design",
    live: "DESIGN SYSTEM",
    meta: "UI KIT",
    body: `
      <div class="bs-sv-biz-ds">
        <div class="bs-sv-biz-ds__row">
          <div class="bs-sv-biz-ds__cell">
            <p class="bs-sv__k">COLOR</p>
            <div class="bs-sv-biz-ds__swatches"><i></i><i></i><i class="is-on"></i><i></i></div>
          </div>
          <div class="bs-sv-biz-ds__cell">
            <p class="bs-sv__k">TYPE</p>
            <p class="bs-sv-biz-ds__aa">Aa</p>
          </div>
        </div>
        <div class="bs-sv-biz-ds__comps">
          <span class="is-on">Button</span><span>Input</span><span>Card</span><span>Nav</span><span>Table</span>
        </div>
        <div class="bs-sv-biz-ds__rules"><span>Consistent</span><span>Reusable</span><span>Ship-ready</span></div>
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
        <div class="bs-sv-biz-part__map">
          <span class="bs-sv-biz-part__node is-a">Brand</span>
          <i></i>
          <span class="bs-sv-biz-part__node is-hub">Newon</span>
          <i></i>
          <span class="bs-sv-biz-part__node is-b">Service</span>
        </div>
        <div class="bs-sv-biz-part__terms">
          <div><span>MODEL</span><strong>Long-term</strong></div>
          <div class="is-on"><span>FOCUS</span><strong>Shared value</strong></div>
          <div><span>OUTPUT</span><strong>Live product</strong></div>
        </div>
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
        <div class="bs-sv-biz-part__map">
          <span class="bs-sv-biz-part__node is-a">App</span>
          <i></i>
          <span class="bs-sv-biz-part__node is-hub">API</span>
          <i></i>
          <span class="bs-sv-biz-part__node is-b">Content</span>
        </div>
        <div class="bs-sv-biz-part__terms">
          <div><span>SURFACE</span><strong>Live Newon</strong></div>
          <div class="is-on"><span>CONNECT</span><strong>Feature</strong></div>
          <div><span>GOAL</span><strong>Users</strong></div>
        </div>
      </div>`,
  });
}

function visualPromotion() {
  return panelShell({
    mod: "promotion",
    live: "PROMO BOARD",
    meta: "MEDIA",
    body: `
      <div class="bs-sv-biz-promo">
        <div class="bs-sv-biz-promo__channels">
          <span class="is-on">In-app</span><span>Web</span><span>Email</span><span>Social</span>
        </div>
        <div class="bs-sv-biz-promo__card is-on">
          <p class="bs-sv__k">PLACEMENT</p>
          <strong>Home · Banner</strong>
          <em>Relevant · Timed</em>
        </div>
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
        <ol class="bs-sv-biz-dev__steps">
          <li><span>01</span><strong>IDEA</strong></li>
          <li><span>02</span><strong>PLAN</strong></li>
          <li><span>03</span><strong>DESIGN</strong></li>
          <li class="is-on"><span>04</span><strong>BUILD</strong></li>
          <li><span>05</span><strong>SHIP</strong></li>
        </ol>
        <div class="bs-sv-biz-dev__panel">
          <div><span>STAGE</span><strong>BUILD</strong></div>
          <div class="is-on"><span>STACK</span><strong>Web · App</strong></div>
          <div><span>HANDOFF</span><strong>Ready</strong></div>
        </div>
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
