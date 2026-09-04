#!/usr/bin/env node
/**
 * Render /{lang}/business/{slug}/ for service detail pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { getServiceCopy } from "./business-service-copy.mjs";
import { businessHeroVisual } from "./business-bs-visuals.mjs";
import { streamlinedResearchDetail } from "./research-detail-streamlined.mjs";
import { businessInquiryHref } from "./business-pricing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(ROOT, "templates", "business-service.html"), "utf8");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function brHeadline(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function pageRoute(page) {
  return page.routePath || page.slug;
}

function routeDepth(page) {
  return pageRoute(page).split("/").filter(Boolean).length;
}

function relPrefix(page) {
  return "../".repeat(routeDepth(page));
}

function chromeBase(page) {
  return "../".repeat(routeDepth(page) + 1);
}

function serviceHref(page, targetPage) {
  const route = pageRoute(targetPage);
  return `${relPrefix(page)}${route}/`;
}

function hreflangBlock(page) {
  const route = pageRoute(page);
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/business/${route}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/${route}/" />`);
  return lines.join("\n");
}

function bySlug(slug) {
  return BUSINESS_SERVICE_PAGES.find((s) => s.slug === slug);
}

function inquiryHref(page) {
  const base = `${relPrefix(page)}inquiry/`;
  if (page.slug === "design") {
    // Orphan design page — keep Design type without inventing SoT pricing slug
    const params = new URLSearchParams({
      category: "Business",
      service: "Design",
      slug: "design",
      source: `/business/design/`,
    });
    return `${base}?${params.toString()}#inquiry`;
  }
  return businessInquiryHref(page.slug, base, {
    source: `/business/${pageRoute(page)}/`,
  });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ——— Hero visuals ——— */
function visualPipeline(copy) {
  const d = copy.demo || {};
  const steps = [
    { t: "IDEA", n: "01" },
    { t: "DEFINE", n: "02" },
    { t: "DESIGN", n: "03" },
    { t: "BUILD", n: "04", on: true },
    { t: "TEST", n: "05" },
    { t: "LAUNCH", n: "06" },
  ];
  const progressVal = d.progress?.value || "BUILD";
  const progressIsPct = String(progressVal).trim().endsWith("%");
  const progressBar = progressIsPct
    ? `<div class="bs-demo__bar"><span style="width:${escapeHtml(String(progressVal).trim())}"></span></div>`
    : "";
  const statusVal = d.status?.value || "BUILDING";
  const featuresVal = d.features?.value || d.scope?.value || "CORE ONLY";
  const nextVal = d.next?.value || "QA TEST";

  const stepHtml = steps
    .map(
      (s) =>
        `<div class="bs-pipe__step${s.on ? " is-active" : ""}"><span class="bs-pipe__name">${s.t}</span><span class="bs-pipe__num">${s.n}</span></div>`
    )
    .join('<span class="bs-pipe__conn" aria-hidden="true"></span>');

  return `<div class="bs-visual bs-visual--pipe" aria-hidden="true">
    <div class="bs-pipe">
      <div class="bs-pipe__track">${stepHtml}</div>
      <aside class="bs-pipe-panel">
        <p class="bs-demo__badge">${escapeHtml(copy.demoBadge || "DEMO PROJECT")}</p>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.status?.label || "PROJECT STATUS")}</p>
          <p class="bs-demo__v">${escapeHtml(statusVal)}</p>
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.progress?.label || "PROGRESS")}</p>
          <p class="bs-demo__v">${escapeHtml(progressVal)}</p>
          ${progressBar}
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.features?.label || "CORE FEATURES")}</p>
          <p class="bs-demo__v">${escapeHtml(featuresVal)}</p>
        </div>
        <div class="bs-pipe-panel__row">
          <p class="bs-demo__k">${escapeHtml(d.next?.label || "NEXT")}</p>
          <p class="bs-demo__v">${escapeHtml(nextVal)}</p>
        </div>
      </aside>
    </div>
  </div>`;
}

function visualBrowser() {
  return `<div class="bs-visual bs-visual--browser" aria-hidden="true">
    <div class="bs-browser">
      <div class="bs-browser__bar">
        <div class="bs-browser__dots"><span></span><span></span><span></span></div>
        <div class="bs-browser__url">newproduct.com</div>
      </div>
      <div class="bs-browser__body">
        <div class="bs-browser__nav"><span>Product</span><span>Features</span><span>Contact</span></div>
        <p class="bs-browser__brand">NEW PRODUCT</p>
        <p class="bs-browser__tagline">Build something people want to use.</p>
        <span class="bs-browser__cta-chip">Explore Product →</span>
        <div class="bs-browser__wire" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="bs-browser__metrics">
          <div><span class="bs-browser__mk">SCOPE</span><strong>CORE</strong></div>
          <div><span class="bs-browser__mk">FLOW</span><strong>READY</strong></div>
          <div><span class="bs-browser__mk">LAUNCH</span><strong>NEXT</strong></div>
        </div>
        <p class="bs-demo__badge">MVP CONCEPT</p>
      </div>
    </div>
  </div>`;
}

function visualDevices() {
  return `<div class="bs-visual bs-visual--devices" aria-hidden="true">
    <div class="bs-devices">
      <div class="bs-phone">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">WELCOME</p>
          <p class="bs-phone__title">Get started</p>
          <div class="bs-phone__hero-block"></div>
          <div class="bs-phone__btn">Continue</div>
          <div class="bs-phone__dots"><span class="is-on"></span><span></span><span></span></div>
        </div>
      </div>
      <div class="bs-phone bs-phone--lg">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">TODAY</p>
          <p class="bs-phone__title">Your activity</p>
          <div class="bs-phone__ring"><span>72%</span></div>
          <div class="bs-phone__stat-row"><span></span><span></span></div>
          <div class="bs-phone__card-row"><span></span><span></span></div>
        </div>
      </div>
      <div class="bs-phone">
        <div class="bs-phone__notch"></div>
        <div class="bs-phone__screen">
          <p class="bs-phone__kicker">INSIGHTS</p>
          <p class="bs-phone__title">Weekly Report</p>
          <div class="bs-phone__bars"><i style="height:40%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:85%"></i><i style="height:45%"></i></div>
          <div class="bs-phone__line"></div>
          <div class="bs-phone__line bs-phone__line--short"></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualWorkflow() {
  return `<div class="bs-visual bs-visual--flow" aria-hidden="true">
    <div class="bs-flow">
      <div class="bs-flow__panel">
        <div class="bs-flow__head">
          <span class="bs-flow__live"><i></i> LIVE WORKFLOW</span>
          <span class="bs-flow__meta">DEMO</span>
        </div>
        <div class="bs-flow__body">
          <div class="bs-flow__col">
            <div class="bs-flow__node"><span class="bs-flow__k">INPUT</span><span class="bs-flow__t">Customer Inquiry</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">CLASSIFY</span><span class="bs-flow__t">AI</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">SUMMARIZE</span><span class="bs-flow__t">AI</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">HUMAN</span><span class="bs-flow__t">REVIEW</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">ACTION</span><span class="bs-flow__t">Route</span></div>
          </div>
          <div class="bs-flow__branch">
            <p class="bs-flow__branch-k">OUTPUTS</p>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">EMAIL</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">CRM</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">DATABASE</span></div>
          </div>
        </div>
        <div class="bs-flow__queue">
          <div class="bs-flow__qitem is-done"><span>Classify</span><em>Done</em></div>
          <div class="bs-flow__qitem is-run"><span>Draft reply</span><em>Running</em></div>
          <div class="bs-flow__qitem"><span>Human review</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualDataReporting() {
  return `<div class="bs-visual bs-visual--data" aria-hidden="true">
    <div class="bs-data">
      <div class="bs-data__panel">
        <div class="bs-data__head">
          <span class="bs-data__live"><i></i> LIVE PIPELINE</span>
          <span class="bs-data__meta">DEMO</span>
        </div>
        <div class="bs-data__body">
          <div class="bs-data__pipeline">
            <div class="bs-data__node"><span class="bs-data__k">01</span><span class="bs-data__t">COLLECT</span></div>
            <div class="bs-data__pulse"></div>
            <div class="bs-data__node"><span class="bs-data__k">02</span><span class="bs-data__t">CLEAN</span></div>
            <div class="bs-data__pulse"></div>
            <div class="bs-data__node is-active"><span class="bs-data__k">03</span><span class="bs-data__t">REPORT</span></div>
          </div>
          <div class="bs-data__dash">
            <p class="bs-data__dash-k">WEEKLY METRICS</p>
            <div class="bs-data__metrics">
              <div><span>REVENUE</span><strong>₩12.4M</strong><em>+8%</em></div>
              <div><span>ORDERS</span><strong>284</strong><em>+12%</em></div>
              <div><span>USERS</span><strong>1,842</strong><em>+5%</em></div>
            </div>
            <div class="bs-data__bars"><i style="height:45%"></i><i style="height:62%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:71%"></i><i style="height:85%"></i><i style="height:92%"></i></div>
            <div class="bs-data__footer">
              <span class="bs-data__status is-run">Generating report</span>
              <span class="bs-data__time">Last sync · 2m ago</span>
            </div>
          </div>
        </div>
        <div class="bs-data__queue">
          <div class="bs-data__qitem is-done"><span>Sheets sync</span><em>Done</em></div>
          <div class="bs-data__qitem is-run"><span>Metric calc</span><em>Running</em></div>
          <div class="bs-data__qitem"><span>Email delivery</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualMarketResearch() {
  return `<div class="bs-visual bs-visual--mr" aria-hidden="true">
    <div class="bs-mr">
      <div class="bs-mr__panel">
        <div class="bs-mr__head">
          <span class="bs-mr__live"><i></i> LIVE MARKET MAP</span>
          <span class="bs-mr__meta">DEMO</span>
        </div>
        <div class="bs-mr__body">
          <div class="bs-mr__sources">
            <p class="bs-mr__sources-k">SOURCES</p>
            <div class="bs-mr__chips">
              <span class="bs-mr__chip is-on">Reports</span>
              <span class="bs-mr__chip">News</span>
              <span class="bs-mr__chip is-on">Reviews</span>
              <span class="bs-mr__chip">Stats</span>
              <span class="bs-mr__chip">Filings</span>
            </div>
            <div class="bs-mr__pipe">
              <span class="bs-mr__pipe-dot"></span>
              <span class="bs-mr__pipe-line"></span>
              <span class="bs-mr__pipe-dot is-on"></span>
              <span class="bs-mr__pipe-line"></span>
              <span class="bs-mr__pipe-dot"></span>
            </div>
            <p class="bs-mr__sources-n">24 reviewed</p>
          </div>
          <div class="bs-mr__map">
            <div class="bs-mr__map-head">
              <p class="bs-mr__map-k">CATEGORY LANDSCAPE</p>
              <span class="bs-mr__map-tag">Mapping</span>
            </div>
            <div class="bs-mr__canvas">
              <span class="bs-mr__axis bs-mr__axis--y">Premium</span>
              <span class="bs-mr__axis bs-mr__axis--x">B2B</span>
              <span class="bs-mr__axis bs-mr__axis--xr">B2C</span>
              <div class="bs-mr__grid">
                <div class="bs-mr__cell"></div>
                <div class="bs-mr__cell"></div>
                <div class="bs-mr__cell"></div>
                <div class="bs-mr__cell"></div>
              </div>
              <span class="bs-mr__player" style="left:22%;top:28%">A</span>
              <span class="bs-mr__player" style="left:38%;top:42%">B</span>
              <span class="bs-mr__player is-on" style="left:62%;top:35%">C</span>
              <span class="bs-mr__player" style="left:78%;top:55%">D</span>
              <span class="bs-mr__player is-you" style="left:48%;top:68%">?</span>
              <span class="bs-mr__opp" style="left:54%;top:22%;width:34%;height:38%"></span>
            </div>
            <div class="bs-mr__stats">
              <div><span>SEGMENTS</span><strong>6</strong></div>
              <div><span>PLAYERS</span><strong>12</strong></div>
              <div class="is-on"><span>OPPS</span><strong>4</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-mr__queue">
          <div class="bs-mr__qitem is-done"><span>Scope defined</span><em>Done</em></div>
          <div class="bs-mr__qitem is-run"><span>Player mapping</span><em>Running</em></div>
          <div class="bs-mr__qitem"><span>Brief draft</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualCompetitorAnalysis() {
  return `<div class="bs-visual bs-visual--ca" aria-hidden="true">
    <div class="bs-ca">
      <div class="bs-ca__panel">
        <div class="bs-ca__head">
          <span class="bs-ca__live"><i></i> LIVE COMPARE MATRIX</span>
          <span class="bs-ca__meta">DEMO</span>
        </div>
        <div class="bs-ca__body">
          <div class="bs-ca__criteria">
            <p class="bs-ca__criteria-k">CRITERIA</p>
            <div class="bs-ca__criteria-list">
              <span class="is-on">Features</span>
              <span>Pricing</span>
              <span>Messaging</span>
              <span>Target</span>
            </div>
            <p class="bs-ca__criteria-n">5 competitors</p>
          </div>
          <div class="bs-ca__matrix">
            <div class="bs-ca__matrix-head">
              <p class="bs-ca__matrix-k">COMPETITOR MATRIX</p>
              <span class="bs-ca__matrix-tag">Comparing</span>
            </div>
            <div class="bs-ca__table">
              <div class="bs-ca__row bs-ca__row--head"><span></span><span>A</span><span>B</span><span>C</span><span>You</span></div>
              <div class="bs-ca__row"><span>Core</span><i class="is-y"></i><i class="is-y"></i><i class="is-p"></i><i class="is-n"></i></div>
              <div class="bs-ca__row"><span>Price</span><i class="is-p"></i><i class="is-y"></i><i class="is-y"></i><i class="is-p"></i></div>
              <div class="bs-ca__row"><span>Message</span><i class="is-y"></i><i class="is-p"></i><i class="is-n"></i><i class="is-y"></i></div>
              <div class="bs-ca__row"><span>Target</span><i class="is-p"></i><i class="is-y"></i><i class="is-y"></i><i class="is-on"></i></div>
            </div>
            <div class="bs-ca__stats">
              <div><span>AXES</span><strong>4</strong></div>
              <div><span>GAPS</span><strong>3</strong></div>
              <div class="is-on"><span>PRIORITY</span><strong>2</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-ca__queue">
          <div class="bs-ca__qitem is-done"><span>Set defined</span><em>Done</em></div>
          <div class="bs-ca__qitem is-run"><span>Matrix build</span><em>Running</em></div>
          <div class="bs-ca__qitem"><span>Summary draft</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualConsumerResearch() {
  return `<div class="bs-visual bs-visual--cr" aria-hidden="true">
    <div class="bs-cr">
      <div class="bs-cr__panel">
        <div class="bs-cr__head">
          <span class="bs-cr__live"><i></i> LIVE INSIGHT MAP</span>
          <span class="bs-cr__meta">DEMO</span>
        </div>
        <div class="bs-cr__body">
          <div class="bs-cr__signals">
            <p class="bs-cr__signals-k">SIGNALS</p>
            <div class="bs-cr__chips">
              <span class="is-on">Reviews</span>
              <span>Surveys</span>
              <span class="is-on">Interviews</span>
              <span>Support</span>
              <span>Usage</span>
            </div>
            <p class="bs-cr__signals-n">128 signals reviewed</p>
          </div>
          <div class="bs-cr__map">
            <div class="bs-cr__map-head">
              <p class="bs-cr__map-k">SEGMENT · NEED MAP</p>
              <span class="bs-cr__map-tag">Mapping</span>
            </div>
            <div class="bs-cr__segments">
              <div class="bs-cr__seg is-on"><span>A</span><strong>Power users</strong><em>Speed · control</em></div>
              <div class="bs-cr__seg"><span>B</span><strong>New adopters</strong><em>Onboarding · trust</em></div>
              <div class="bs-cr__seg"><span>C</span><strong>Price-sensitive</strong><em>Value · clarity</em></div>
            </div>
            <div class="bs-cr__themes">
              <span class="is-on">Onboarding</span>
              <span>Pricing clarity</span>
              <span>Support speed</span>
              <span>Feature gaps</span>
            </div>
            <div class="bs-cr__stats">
              <div><span>SEGMENTS</span><strong>4</strong></div>
              <div><span>THEMES</span><strong>8</strong></div>
              <div class="is-on"><span>PRIORITY</span><strong>3</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-cr__queue">
          <div class="bs-cr__qitem is-done"><span>Questions defined</span><em>Done</em></div>
          <div class="bs-cr__qitem is-run"><span>Pattern map</span><em>Running</em></div>
          <div class="bs-cr__qitem"><span>Insight brief</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualUxAudit() {
  return `<div class="bs-visual bs-visual--ux" aria-hidden="true">
    <div class="bs-ux">
      <div class="bs-ux__panel">
        <div class="bs-ux__head">
          <span class="bs-ux__live"><i></i> LIVE FLOW AUDIT</span>
          <span class="bs-ux__meta">DEMO</span>
        </div>
        <div class="bs-ux__body">
          <div class="bs-ux__flows">
            <p class="bs-ux__flows-k">CORE FLOWS</p>
            <div class="bs-ux__flow-list">
              <div class="bs-ux__flow is-run"><span>01</span><strong>Onboarding</strong><em>Reviewing</em></div>
              <div class="bs-ux__flow is-on"><span>02</span><strong>Checkout</strong><em>Critical</em></div>
              <div class="bs-ux__flow"><span>03</span><strong>Settings</strong><em>Queued</em></div>
            </div>
            <p class="bs-ux__flows-n">5 flows in scope</p>
          </div>
          <div class="bs-ux__issues">
            <div class="bs-ux__issues-head">
              <p class="bs-ux__issues-k">ISSUE · PRIORITY</p>
              <span class="bs-ux__issues-tag">Auditing</span>
            </div>
            <div class="bs-ux__issue-list">
              <div class="bs-ux__issue is-p1"><span>P1</span><strong>Checkout step unclear</strong><em>Checkout</em></div>
              <div class="bs-ux__issue is-p2"><span>P2</span><strong>Form label mismatch</strong><em>Signup</em></div>
              <div class="bs-ux__issue"><span>P3</span><strong>Empty state missing</strong><em>Dashboard</em></div>
            </div>
            <div class="bs-ux__tags">
              <span class="is-on">Friction</span>
              <span>IA</span>
              <span>Mobile</span>
              <span>Quick win</span>
            </div>
            <div class="bs-ux__stats">
              <div><span>FLOWS</span><strong>5</strong></div>
              <div><span>ISSUES</span><strong>14</strong></div>
              <div class="is-on"><span>CRITICAL</span><strong>3</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-ux__queue">
          <div class="bs-ux__qitem is-done"><span>Scope defined</span><em>Done</em></div>
          <div class="bs-ux__qitem is-run"><span>Flow review</span><em>Running</em></div>
          <div class="bs-ux__qitem"><span>Action list</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualCustomProduct() {
  return `<div class="bs-visual bs-visual--cp" aria-hidden="true">
    <div class="bs-cp">
      <div class="bs-cp__panel">
        <div class="bs-cp__head">
          <span class="bs-cp__live"><i></i> LIVE PRODUCT BLUEPRINT</span>
          <span class="bs-cp__meta">DEMO</span>
        </div>
        <div class="bs-cp__body">
          <div class="bs-cp__problem">
            <p class="bs-cp__problem-k">PROBLEM · USERS</p>
            <div class="bs-cp__chips">
              <span class="is-on">Workflow</span>
              <span>Ops team</span>
              <span class="is-on">Approvals</span>
              <span>Partners</span>
              <span>Reporting</span>
            </div>
            <p class="bs-cp__problem-n">Custom fit required</p>
          </div>
          <div class="bs-cp__blueprint">
            <div class="bs-cp__blueprint-head">
              <p class="bs-cp__blueprint-k">MODULE · PHASE MAP</p>
              <span class="bs-cp__blueprint-tag">Scoping</span>
            </div>
            <div class="bs-cp__modules">
              <div class="bs-cp__mod is-on"><span>01</span><strong>Core workflow</strong><em>Phase 1</em></div>
              <div class="bs-cp__mod is-on"><span>02</span><strong>Admin console</strong><em>Phase 1</em></div>
              <div class="bs-cp__mod"><span>03</span><strong>CRM sync</strong><em>Phase 2</em></div>
            </div>
            <div class="bs-cp__layers">
              <span class="is-on">UX/UI</span>
              <span>API</span>
              <span class="is-on">Permissions</span>
              <span>Deploy</span>
            </div>
            <div class="bs-cp__stats">
              <div><span>MODULES</span><strong>8</strong></div>
              <div><span>INTEGRATIONS</span><strong>3</strong></div>
              <div class="is-on"><span>PHASE 1</span><strong>5</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-cp__queue">
          <div class="bs-cp__qitem is-done"><span>Scope defined</span><em>Done</em></div>
          <div class="bs-cp__qitem is-run"><span>Design sync</span><em>Running</em></div>
          <div class="bs-cp__qitem"><span>Build sprint</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualTrendResearch() {
  return `<div class="bs-visual bs-visual--tr" aria-hidden="true">
    <div class="bs-tr">
      <div class="bs-tr__panel">
        <div class="bs-tr__head">
          <span class="bs-tr__live"><i></i> LIVE TREND MAP</span>
          <span class="bs-tr__meta">DEMO</span>
        </div>
        <div class="bs-tr__body">
          <div class="bs-tr__sources">
            <p class="bs-tr__sources-k">SIGNALS</p>
            <div class="bs-tr__chips">
              <span class="is-on">Reports</span>
              <span>News</span>
              <span class="is-on">Launches</span>
              <span>Social</span>
              <span>Policy</span>
            </div>
            <p class="bs-tr__sources-n">86 signals scanned</p>
          </div>
          <div class="bs-tr__map">
            <div class="bs-tr__map-head">
              <p class="bs-tr__map-k">THEME · TIMELINE</p>
              <span class="bs-tr__map-tag">Clustering</span>
            </div>
            <div class="bs-tr__themes">
              <div class="bs-tr__theme is-rising"><span>↑</span><strong>AI-assisted workflows</strong><em>Rising</em></div>
              <div class="bs-tr__theme is-emerging"><span>◆</span><strong>Privacy-first UX</strong><em>Emerging</em></div>
              <div class="bs-tr__theme"><span>—</span><strong>Subscription fatigue</strong><em>Stable</em></div>
            </div>
            <div class="bs-tr__horizons">
              <span class="is-on">Near-term</span>
              <span>Mid-term</span>
              <span>Watchlist</span>
              <span>Opportunity</span>
            </div>
            <div class="bs-tr__stats">
              <div><span>THEMES</span><strong>6</strong></div>
              <div><span>SIGNALS</span><strong>86</strong></div>
              <div class="is-on"><span>RISING</span><strong>2</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-tr__queue">
          <div class="bs-tr__qitem is-done"><span>Topic defined</span><em>Done</em></div>
          <div class="bs-tr__qitem is-run"><span>Pattern scan</span><em>Running</em></div>
          <div class="bs-tr__qitem"><span>Trend brief</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualProductLaunch() {
  return `<div class="bs-visual bs-visual--pl" aria-hidden="true">
    <div class="bs-pl">
      <div class="bs-pl__panel">
        <div class="bs-pl__head">
          <span class="bs-pl__live"><i></i> LIVE LAUNCH TRACKER</span>
          <span class="bs-pl__meta">DEMO</span>
        </div>
        <div class="bs-pl__body">
          <div class="bs-pl__stages">
            <p class="bs-pl__stages-k">LAUNCH STAGES</p>
            <div class="bs-pl__stage-list">
              <div class="bs-pl__stage is-done"><span>01</span><strong>Idea</strong><em>Done</em></div>
              <div class="bs-pl__stage is-done"><span>02</span><strong>Strategy</strong><em>Done</em></div>
              <div class="bs-pl__stage is-run"><span>03</span><strong>Build</strong><em>Running</em></div>
              <div class="bs-pl__stage"><span>04</span><strong>Launch</strong><em>Queued</em></div>
            </div>
            <p class="bs-pl__stages-n">6 stages in flow</p>
          </div>
          <div class="bs-pl__checklist">
            <div class="bs-pl__checklist-head">
              <p class="bs-pl__checklist-k">READINESS · CHECKLIST</p>
              <span class="bs-pl__checklist-tag">Pre-launch</span>
            </div>
            <div class="bs-pl__checks">
              <div class="bs-pl__check is-done"><span>✓</span><strong>MVP core</strong><em>Product</em></div>
              <div class="bs-pl__check is-run"><span>◐</span><strong>Launch landing</strong><em>Landing</em></div>
              <div class="bs-pl__check"><span>○</span><strong>Analytics setup</strong><em>Ops</em></div>
            </div>
            <div class="bs-pl__tags">
              <span class="is-on">Product</span>
              <span class="is-on">Landing</span>
              <span>Domain</span>
              <span>QA</span>
            </div>
            <div class="bs-pl__stats">
              <div><span>STAGES</span><strong>6</strong></div>
              <div><span>READY</span><strong>4</strong></div>
              <div class="is-on"><span>BLOCKERS</span><strong>1</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-pl__queue">
          <div class="bs-pl__qitem is-done"><span>Strategy aligned</span><em>Done</em></div>
          <div class="bs-pl__qitem is-run"><span>Build sprint</span><em>Running</em></div>
          <div class="bs-pl__qitem"><span>Go-live prep</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualInternalSystem() {
  return `<div class="bs-visual bs-visual--is" aria-hidden="true">
    <div class="bs-is">
      <div class="bs-is__panel">
        <div class="bs-is__head">
          <span class="bs-is__live"><i></i> LIVE OPS CONSOLE</span>
          <span class="bs-is__meta">DEMO</span>
        </div>
        <div class="bs-is__body">
          <div class="bs-is__roles">
            <p class="bs-is__roles-k">ROLES · TEAMS</p>
            <div class="bs-is__chips">
              <span class="is-on">Ops</span>
              <span>Finance</span>
              <span class="is-on">HR</span>
              <span>Admin</span>
              <span>Manager</span>
            </div>
            <p class="bs-is__roles-n">5 roles configured</p>
          </div>
          <div class="bs-is__console">
            <div class="bs-is__console-head">
              <p class="bs-is__console-k">REQUEST · QUEUE</p>
              <span class="bs-is__console-tag">Processing</span>
            </div>
            <div class="bs-is__queue">
              <div class="bs-is__qrow is-run"><span>#128</span><strong>Budget approval</strong><em>Review</em></div>
              <div class="bs-is__qrow is-on"><span>#127</span><strong>Asset request</strong><em>Pending</em></div>
              <div class="bs-is__qrow"><span>#126</span><strong>Vendor onboarding</strong><em>Done</em></div>
            </div>
            <div class="bs-is__modules">
              <span class="is-on">Approval</span>
              <span>Dashboard</span>
              <span class="is-on">Admin</span>
              <span>Report</span>
            </div>
            <div class="bs-is__stats">
              <div><span>MODULES</span><strong>6</strong></div>
              <div><span>OPEN</span><strong>12</strong></div>
              <div class="is-on"><span>ROLES</span><strong>5</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-is__footer">
          <div class="bs-is__fitem is-done"><span>Requirements mapped</span><em>Done</em></div>
          <div class="bs-is__fitem is-run"><span>Permissions setup</span><em>Running</em></div>
          <div class="bs-is__fitem"><span>Deploy</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualMvpDetail() {
  const steps = [
    { t: "IDEA", n: "01" },
    { t: "DEFINE", n: "02" },
    { t: "DESIGN", n: "03" },
    { t: "BUILD", n: "04", on: true },
    { t: "TEST", n: "05" },
    { t: "LAUNCH", n: "06" },
  ];
  const stepHtml = steps
    .map(
      (s) =>
        `<div class="bs-pipe__step${s.on ? " is-active" : ""}"><span class="bs-pipe__name">${s.t}</span><span class="bs-pipe__num">${s.n}</span></div>`
    )
    .join('<span class="bs-pipe__conn" aria-hidden="true"></span>');

  return `<div class="bs-visual bs-visual--mvp" aria-hidden="true">
    <div class="bs-mvp-hero">
      <div class="bs-mvp-hero__head">
        <span class="bs-mvp-hero__live"><i></i> MVP BUILD PIPELINE</span>
        <span class="bs-mvp-hero__meta">DEMO</span>
      </div>
      <div class="bs-pipe">
        <div class="bs-pipe__track">${stepHtml}</div>
        <aside class="bs-pipe-panel">
          <p class="bs-demo__badge">DEMO PROJECT</p>
          <div class="bs-pipe-panel__row">
            <p class="bs-demo__k">PROJECT STATUS</p>
            <p class="bs-demo__v">BUILDING</p>
          </div>
          <div class="bs-pipe-panel__row">
            <p class="bs-demo__k">CURRENT STAGE</p>
            <p class="bs-demo__v">BUILD</p>
          </div>
          <div class="bs-pipe-panel__row">
            <p class="bs-demo__k">SCOPE</p>
            <p class="bs-demo__v">CORE ONLY</p>
          </div>
          <div class="bs-pipe-panel__row">
            <p class="bs-demo__k">NEXT</p>
            <p class="bs-demo__v">QA TEST</p>
          </div>
        </aside>
      </div>
    </div>
  </div>`;
}

function visualWebDetail() {
  return `<div class="bs-visual bs-visual--web" aria-hidden="true">
    <div class="bs-browser">
      <div class="bs-browser__bar">
        <div class="bs-browser__dots"><span></span><span></span><span></span></div>
        <div class="bs-browser__url">yourbrand.com</div>
      </div>
      <div class="bs-browser__body">
        <div class="bs-browser__nav"><span class="is-on">Home</span><span>About</span><span>Service</span><span>Work</span><span>Contact</span></div>
        <p class="bs-browser__brand">YOUR BRAND</p>
        <p class="bs-browser__tagline">Build a site people trust and use.</p>
        <span class="bs-browser__cta-chip">Get started →</span>
        <div class="bs-browser__wire" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="bs-browser__metrics">
          <div><span class="bs-browser__mk">STRUCTURE</span><strong>CLEAR</strong></div>
          <div><span class="bs-browser__mk">RESPONSIVE</span><strong>READY</strong></div>
          <div><span class="bs-browser__mk">CTA</span><strong>WIRED</strong></div>
        </div>
        <p class="bs-demo__badge">SITE CONCEPT</p>
      </div>
    </div>
  </div>`;
}

function visualLandingDetail() {
  return `<div class="bs-visual bs-visual--lp" aria-hidden="true">
    <div class="bs-lp-scroll">
      <div class="bs-lp-scroll__head">
        <span class="bs-lp-scroll__live"><i></i> LANDING WIREFRAME</span>
        <span class="bs-lp-scroll__meta">DEMO</span>
      </div>
      <div class="bs-lp-scroll__body">
        <div class="bs-lp-scroll__page">
          <section class="bs-lp-scroll__block is-hero">
            <span class="bs-lp-scroll__label">HERO</span>
            <p class="bs-lp-scroll__title">Launch your product faster</p>
            <span class="bs-lp-scroll__cta">Sign up →</span>
          </section>
          <section class="bs-lp-scroll__block">
            <span class="bs-lp-scroll__label">VALUE</span>
            <div class="bs-lp-scroll__lines"><i></i><i style="width:80%"></i></div>
          </section>
          <section class="bs-lp-scroll__block">
            <span class="bs-lp-scroll__label">PROOF</span>
            <div class="bs-lp-scroll__cards"><i></i><i></i><i></i></div>
          </section>
          <section class="bs-lp-scroll__block is-active">
            <span class="bs-lp-scroll__label">CTA</span>
            <span class="bs-lp-scroll__cta">Start free trial →</span>
          </section>
        </div>
        <aside class="bs-lp-scroll__funnel">
          <p class="bs-lp-scroll__funnel-k">CONVERSION</p>
          <div class="bs-lp-scroll__funnel-steps">
            <div><span>Visit</span><strong>100%</strong></div>
            <div><span>Scroll</span><strong>72%</strong></div>
            <div class="is-on"><span>Click CTA</span><strong>18%</strong></div>
            <div><span>Sign up</span><strong>6%</strong></div>
          </div>
        </aside>
      </div>
    </div>
  </div>`;
}

function visualAppDetail() {
  return `<div class="bs-visual bs-visual--app" aria-hidden="true">
    <div class="bs-app-hero">
      <div class="bs-app-hero__head">
        <span class="bs-app-hero__live"><i></i> APP PROTOTYPE</span>
        <span class="bs-app-hero__meta">DEMO · v0.3</span>
      </div>
      <div class="bs-devices">
        <div class="bs-phone">
          <div class="bs-phone__notch"></div>
          <div class="bs-phone__screen">
            <p class="bs-phone__kicker">ONBOARD</p>
            <p class="bs-phone__title">Get started</p>
            <div class="bs-phone__hero-block"></div>
            <div class="bs-phone__btn">Continue</div>
            <div class="bs-phone__dots"><span class="is-on"></span><span></span><span></span></div>
          </div>
        </div>
        <div class="bs-phone bs-phone--lg">
          <div class="bs-phone__notch"></div>
          <div class="bs-phone__screen">
            <p class="bs-phone__kicker">HOME</p>
            <p class="bs-phone__title">Your activity</p>
            <div class="bs-phone__ring"><span>72%</span></div>
            <div class="bs-phone__stat-row"><span></span><span></span></div>
            <div class="bs-phone__card-row"><span></span><span></span></div>
          </div>
        </div>
        <div class="bs-phone">
          <div class="bs-phone__notch"></div>
          <div class="bs-phone__screen">
            <p class="bs-phone__kicker">PROFILE</p>
            <p class="bs-phone__title">Settings</p>
            <div class="bs-phone__bars"><i style="height:40%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:85%"></i></div>
            <div class="bs-phone__line"></div>
          </div>
        </div>
      </div>
      <div class="bs-app-hero__foot">
        <span>iOS</span><span>Android</span><span>12 screens</span><span>3 flows</span>
      </div>
    </div>
  </div>`;
}

function visualAiDetail() {
  return `<div class="bs-visual bs-visual--ai" aria-hidden="true">
    <div class="bs-flow">
      <div class="bs-flow__panel">
        <div class="bs-flow__head">
          <span class="bs-flow__live"><i></i> AI AUTOMATION LOOP</span>
          <span class="bs-flow__meta">DEMO</span>
        </div>
        <div class="bs-flow__body">
          <div class="bs-flow__col">
            <div class="bs-flow__node"><span class="bs-flow__k">INPUT</span><span class="bs-flow__t">Customer inquiry</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">CLASSIFY</span><span class="bs-flow__t">AI · 92%</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node is-ai"><span class="bs-flow__k">SUMMARIZE</span><span class="bs-flow__t">AI</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">HUMAN</span><span class="bs-flow__t">Review</span></div>
            <div class="bs-flow__pulse"></div>
            <div class="bs-flow__node"><span class="bs-flow__k">ACTION</span><span class="bs-flow__t">Route + reply</span></div>
          </div>
          <div class="bs-flow__branch">
            <p class="bs-flow__branch-k">OUTPUTS</p>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">EMAIL</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">CRM</span></div>
            <div class="bs-flow__node bs-flow__node--sm"><span class="bs-flow__t">SLACK</span></div>
          </div>
        </div>
        <div class="bs-flow__queue">
          <div class="bs-flow__qitem is-done"><span>Classify</span><em>Done</em></div>
          <div class="bs-flow__qitem is-run"><span>Draft reply</span><em>Running</em></div>
          <div class="bs-flow__qitem"><span>Human review</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualWhiteLabelDetail() {
  return `<div class="bs-visual bs-visual--wl" aria-hidden="true">
    <div class="bs-transform">
      <div class="bs-transform__panel">
        <div class="bs-transform__head">
          <span class="bs-transform__live"><i></i> WHITE-LABEL TRANSFORM</span>
          <span class="bs-transform__meta">DEMO</span>
        </div>
        <div class="bs-transform__stages">
          <div class="bs-transform__stage is-core">
            <p class="bs-transform__k">CORE PRODUCT</p>
            <div class="bs-transform__mock is-gray">
              <span></span><span></span><span></span>
            </div>
            <p class="bs-transform__note">Validated modules</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-custom">
            <p class="bs-transform__k">YOUR BRAND</p>
            <div class="bs-transform__chips">
              <span class="is-on">Logo</span><span class="is-on">Color</span><span>Domain</span><span>Features</span>
            </div>
            <p class="bs-transform__note">Brand + module config</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-yours">
            <p class="bs-transform__k">YOUR PRODUCT</p>
            <div class="bs-transform__mock is-brand">
              <strong>N</strong><span></span><span></span>
            </div>
            <p class="bs-transform__note">app.yourbrand.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualBrandStack() {
  return `<div class="bs-visual bs-visual--transform" aria-hidden="true">
    <div class="bs-transform">
      <div class="bs-transform__panel">
        <div class="bs-transform__head">
          <span class="bs-transform__live"><i></i> BRAND TRANSFORM</span>
          <span class="bs-transform__meta">DEMO</span>
        </div>
        <div class="bs-transform__stages">
          <div class="bs-transform__stage is-core">
            <p class="bs-transform__k">CORE PRODUCT</p>
            <div class="bs-transform__mock is-gray">
              <span></span><span></span><span></span>
            </div>
            <p class="bs-transform__note">Shared foundation</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-custom">
            <p class="bs-transform__k">CUSTOMIZE</p>
            <div class="bs-transform__chips">
              <span>Brand</span><span>Logo</span><span>Color</span><span>Feature</span><span>Content</span>
            </div>
            <p class="bs-transform__note">Map identity + modules</p>
          </div>
          <div class="bs-transform__arrow" aria-hidden="true">→</div>
          <div class="bs-transform__stage is-yours">
            <p class="bs-transform__k">YOUR PRODUCT</p>
            <div class="bs-transform__mock is-brand">
              <strong>N</strong><span></span><span></span>
            </div>
            <p class="bs-transform__note">Ready on your domain</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualSystem() {
  return `<div class="bs-visual bs-visual--sys" aria-hidden="true">
    <div class="bs-sys-bento">
      <div class="bs-sys-bento__head">
        <span class="bs-sys-bento__live"><i></i> DESIGN SYSTEM</span>
        <span class="bs-sys-bento__meta">DEMO</span>
      </div>
      <div class="bs-sys-bento__grid">
        <div class="bs-sys-bento__cell">
          <p class="bs-sys-bento__k">LOGO</p>
          <div class="bs-sys-bento__logo">N</div>
        </div>
        <div class="bs-sys-bento__cell">
          <p class="bs-sys-bento__k">TYPOGRAPHY</p>
          <div class="bs-sys-bento__type">Aa</div>
          <p class="bs-sys-bento__sub">Inter / Pretendard</p>
        </div>
        <div class="bs-sys-bento__cell">
          <p class="bs-sys-bento__k">COLOR</p>
          <div class="bs-sys-bento__swatches">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="bs-sys-bento__cell bs-sys-bento__cell--wide">
          <p class="bs-sys-bento__k">COMPONENTS</p>
          <div class="bs-sys-bento__comps">
            <span class="is-btn">Button</span>
            <span class="is-input">Input field</span>
            <span class="is-toggle"><i></i></span>
            <span class="is-card"><i></i><i></i></span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualInternalTools() {
  return `<div class="bs-visual bs-visual--tools" aria-hidden="true">
    <div class="bs-tools">
      <div class="bs-tools__panel">
        <div class="bs-tools__head">
          <span class="bs-tools__live"><i></i> LIVE OPS CONSOLE</span>
          <span class="bs-tools__meta">DEMO</span>
        </div>
        <div class="bs-tools__body">
          <aside class="bs-tools__nav">
            <span class="is-on">Inbox</span>
            <span>Board</span>
            <span>Approvals</span>
            <span>Team</span>
          </aside>
          <div class="bs-tools__main">
            <div class="bs-tools__top">
              <p class="bs-tools__title">Request queue</p>
              <span class="bs-tools__pill">12 open</span>
            </div>
            <div class="bs-tools__rows">
              <div class="bs-tools__row is-active"><span>#214</span><strong>Budget approval</strong><em class="is-review">REVIEW</em></div>
              <div class="bs-tools__row"><span>#213</span><strong>Asset check-in</strong><em class="is-run">IN PROGRESS</em></div>
              <div class="bs-tools__row"><span>#212</span><strong>Onboarding form</strong><em class="is-done">DONE</em></div>
            </div>
            <div class="bs-tools__board">
              <div><p>INTAKE</p><i></i><i></i></div>
              <div class="is-on"><p>PROCESS</p><i></i><i></i><i></i></div>
              <div><p>DONE</p><i></i></div>
            </div>
          </div>
        </div>
        <div class="bs-tools__queue">
          <div class="bs-tools__qitem is-done"><span>Role access</span><em>Ready</em></div>
          <div class="bs-tools__qitem is-run"><span>Workflow build</span><em>Running</em></div>
          <div class="bs-tools__qitem"><span>Handoff</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function visualWorkflowAutomation() {
  return `<div class="bs-visual bs-visual--wfa" aria-hidden="true">
    <div class="bs-wfa">
      <div class="bs-wfa__panel">
        <div class="bs-wfa__head">
          <span class="bs-wfa__live"><i></i> LIVE WORKFLOW</span>
          <span class="bs-wfa__meta">DEMO</span>
        </div>
        <div class="bs-wfa__body">
          <div class="bs-wfa__col">
            <div class="bs-wfa__node is-trigger"><span class="bs-wfa__k">TRIGGER</span><span class="bs-wfa__t">New inquiry</span></div>
            <div class="bs-wfa__pulse"></div>
            <div class="bs-wfa__node"><span class="bs-wfa__k">CONDITION</span><span class="bs-wfa__t">Route by type</span></div>
            <div class="bs-wfa__pulse"></div>
            <div class="bs-wfa__node is-active"><span class="bs-wfa__k">ACTION</span><span class="bs-wfa__t">Notify + CRM</span></div>
          </div>
          <div class="bs-wfa__branch">
            <p class="bs-wfa__branch-k">OUTPUTS</p>
            <div class="bs-wfa__node bs-wfa__node--sm"><span class="bs-wfa__t">EMAIL</span></div>
            <div class="bs-wfa__node bs-wfa__node--sm"><span class="bs-wfa__t">SLACK</span></div>
            <div class="bs-wfa__node bs-wfa__node--sm"><span class="bs-wfa__t">SHEET</span></div>
          </div>
        </div>
        <div class="bs-wfa__queue">
          <div class="bs-wfa__qitem is-done"><span>Validate</span><em>Done</em></div>
          <div class="bs-wfa__qitem is-run"><span>Route owner</span><em>Running</em></div>
          <div class="bs-wfa__qitem"><span>Send confirmation</span><em>Queued</em></div>
        </div>
      </div>
    </div>
  </div>`;
}

function heroVisual(visual, copy) {
  switch (visual) {
    case "pipeline":
      return visualPipeline(copy);
    case "browser":
      return visualBrowser();
    case "devices":
      return visualDevices();
    case "workflow":
      return visualWorkflow();
    case "workflow-auto":
      return visualWorkflowAutomation();
    case "data-report":
      return visualDataReporting();
    case "market-research":
      return visualMarketResearch();
    case "competitor-analysis":
      return visualCompetitorAnalysis();
    case "consumer-research":
      return visualConsumerResearch();
    case "ux-audit":
      return visualUxAudit();
    case "trend-research":
      return visualTrendResearch();
    case "custom-product":
      return visualCustomProduct();
    case "product-launch":
      return visualProductLaunch();
    case "internal-system":
      return visualInternalSystem();
    case "mvp":
      return visualMvpDetail();
    case "web":
      return visualWebDetail();
    case "landing-page":
      return visualLandingDetail();
    case "app-prototype":
      return visualAppDetail();
    case "ai-automation":
      return visualAiDetail();
    case "white-label":
      return visualWhiteLabelDetail();
    case "tools":
      return visualInternalTools();
    case "brand-stack":
      return visualBrandStack();
    case "system":
      return visualSystem();
    default:
      return "";
  }
}

/* ——— Shared chrome ——— */
function breadcrumb(copy, page) {
  const prefix = relPrefix(page);
  const biz = escapeHtml(copy.crumbBusiness || "BUSINESS");
  const svc = escapeHtml(copy.crumbServices || "SERVICES");
  const current = escapeHtml(copy.eyebrow || "");
  return `<nav class="bs-crumb" aria-label="Breadcrumb">
    <div class="bs-inner">
      <a href="${prefix}">${biz}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <a href="${prefix}#services">${svc}</a>
      <span class="bs-crumb__sep" aria-hidden="true">/</span>
      <span>${current}</span>
    </div>
  </nav>`;
}

function serviceNav(page, copies) {
  const activeSlug = page.slug;
  const prefix = relPrefix(page);
  const links = BUSINESS_SERVICE_PAGES.map((s) => {
    const c = copies[s.slug];
    const label = escapeHtml(c?.navLabel || s.slug);
    const cls = s.slug === activeSlug ? "bs-nav__link is-active" : "bs-nav__link";
    const href = s.slug === activeSlug ? "#" : `${prefix}${pageRoute(s)}/`;
    return `<a class="${cls}" href="${href}"${s.slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<nav class="bs-nav" aria-label="Services"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">SERVICES</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function adjacentHtml(page, copy, copies) {
  const idx = BUSINESS_SERVICE_PAGES.findIndex((s) => s.slug === page.slug);
  const prev = idx > 0 ? BUSINESS_SERVICE_PAGES[idx - 1] : null;
  const next = idx < BUSINESS_SERVICE_PAGES.length - 1 ? BUSINESS_SERVICE_PAGES[idx + 1] : null;
  const prevLabel = escapeHtml(copy.prevLabel || "PREVIOUS SERVICE");
  const nextLabel = escapeHtml(copy.nextLabel || "NEXT SERVICE");

  let prevBlock = "";
  let nextBlock = "";
  if (prev) {
    const c = copies[prev.slug];
    prevBlock = `<a class="bs-adjacent__link bs-adjacent__link--prev" href="${serviceHref(page, prev)}">
      <span class="bs-adjacent__label">${prevLabel}</span>
      <span class="bs-adjacent__name">${escapeHtml(c?.navLabel || c?.eyebrow || prev.slug)}</span>
    </a>`;
  } else {
    prevBlock = `<span class="bs-adjacent__link bs-adjacent__link--prev is-empty"></span>`;
  }
  if (next) {
    const c = copies[next.slug];
    nextBlock = `<a class="bs-adjacent__link bs-adjacent__link--next" href="${serviceHref(page, next)}">
      <span class="bs-adjacent__label">${nextLabel}</span>
      <span class="bs-adjacent__name">${escapeHtml(c?.navLabel || c?.eyebrow || next.slug)}</span>
    </a>`;
  } else {
    nextBlock = `<span class="bs-adjacent__link bs-adjacent__link--next is-empty"></span>`;
  }

  return `<section class="bs-section bs-adjacent" data-bs-reveal aria-label="Adjacent services">
    <div class="bs-inner bs-adjacent__grid">${prevBlock}${nextBlock}</div>
  </section>`;
}

function listNumbered(items, className, variant = "") {
  const mod = variant ? ` ${className}--${variant}` : "";
  return `<ul class="${className}${mod}"${variant ? ` data-variant="${escapeHtml(variant)}"` : ""}>${items
    .map(
      (it) =>
        `<li class="${className}__item"><span class="${className}__n" aria-hidden="true">${escapeHtml(it.n || "")}</span><div class="${className}__copy"><h3>${escapeHtml(it.title || "")}</h3><p>${escapeHtml(it.body || "")}</p></div></li>`
    )
    .join("")}</ul>`;
}

function processList(items) {
  const count = items?.length || 0;
  return `<ol class="bs-process bs-process--steps" data-variant="steps"${count ? ` data-count="${count}"` : ""}>${items
    .map(
      (it) =>
        `<li class="bs-process__item"><span class="bs-process__n" aria-hidden="true">${escapeHtml(it.n || "")}</span><div class="bs-process__copy"><h3>${escapeHtml(it.title || "")}</h3><p>${escapeHtml(it.body || "")}</p></div></li>`
    )
    .join("")}</ol>`;
}

function chips(items, variant = "included") {
  return `<ul class="bs-deliver bs-deliver--${variant}" data-variant="${escapeHtml(variant)}">${items
    .map(
      (t, i) =>
        `<li class="bs-deliver__item"><span class="bs-deliver__n" aria-hidden="true">${pad2(i + 1)}</span><span class="bs-deliver__t">${escapeHtml(t)}</span></li>`
    )
    .join("")}</ul>`;
}

function tagChips(items) {
  return `<ul class="bs-chips bs-chips--tags">${(items || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("")}</ul>`;
}

function useCasesHtml(items) {
  const list = items || [];
  if (!list.length) return "";
  const count = list.length;
  return `<div class="bs-use-board" data-count="${count}">${list
    .map((it, i) => {
      const n = escapeHtml(it.n || pad2(i + 1));
      const tag = it.tag
        ? `<span class="bs-use-board__tag">${escapeHtml(it.tag)}</span>`
        : "";
      return `<article class="bs-use-board__item">
        <div class="bs-use-board__meta">
          <span class="bs-use-board__n" aria-hidden="true">${n}</span>
          ${tag}
        </div>
        <h3 class="bs-use-board__title">${escapeHtml(it.title || "")}</h3>
        <p class="bs-use-board__body">${flowBodyHtml(it.body || "")}</p>
      </article>`;
    })
    .join("")}</div>`;
}

function processStepsHtml(processDetail) {
  if (!processDetail?.length) return "";
  const items = processDetail.map((p, i) => ({
    n: p.n || pad2(i + 1),
    title: p.title || p.t || "",
    body: p.body || p.d || "",
  }));
  return processList(items);
}

function areasHtml(items, variant = "board") {
  const mod = variant ? ` bs-areas--${variant}` : "";
  return `<div class="bs-areas${mod}" data-variant="${escapeHtml(variant)}">${(items || [])
    .map(
      (it) =>
        `<article class="bs-areas__item"><span class="bs-areas__n" aria-hidden="true">${escapeHtml(it.n || "")}</span><div class="bs-areas__copy"><h3>${escapeHtml(it.title || "")}</h3><p>${flowBodyHtml(it.body || "")}</p></div></article>`
    )
    .join("")}</div>`;
}

function processLayoutCols(count) {
  return Math.max(2, Math.ceil(count / 2));
}

function processRailHtml(steps) {
  if (!steps?.length) return "";
  const cols = processLayoutCols(steps.length);
  return `<div class="bs-rail bs-rail--process" data-cols="${cols}" aria-hidden="true">${steps
    .map(
      (s, i) =>
        `<div class="bs-rail__step"><span class="bs-rail__n">${escapeHtml(s.n || pad2(i + 1))}</span><span class="bs-rail__t">${escapeHtml(s.title)}</span></div>`
    )
    .join("")}</div>`;
}

function flowcapsHtml(items, opts = {}) {
  const mod = opts.modifier ? ` bs-dr-flowcaps--${opts.modifier}` : "";
  const cols = opts.modifier === "process" && items?.length ? processLayoutCols(items.length) : null;
  const colAttr = cols ? ` data-cols="${cols}"` : "";
  return `<div class="bs-dr-flowcaps${mod}"${colAttr}>${(items || [])
    .map((f) => {
      const chips =
        f.examples?.length ?
          `<ul class="bs-flowcap-chips">${f.examples.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`
        : "";
      return `<article class="bs-dr-flowcaps__item"><span class="bs-dr-flowcaps__n">${escapeHtml(f.n || "")}</span><h3>${escapeHtml(f.title || "")}</h3><p>${escapeHtml(f.body || "")}</p>${chips}</article>`;
    })
    .join("")}</div>`;
}

function deliverGridHtml(items, extras, variant = "catalog") {
  let html = `<div class="bs-deliver-grid bs-deliver-grid--${variant}" data-variant="${escapeHtml(variant)}">${(items || [])
    .map(
      (t, i) =>
        `<article class="bs-deliver-grid__item"><span class="bs-deliver-grid__n" aria-hidden="true">${pad2(i + 1)}</span><div class="bs-deliver-grid__copy"><h3>${escapeHtml(typeof t === "string" ? t : t.title || "")}</h3>${typeof t === "object" && t.body ? `<p>${escapeHtml(t.body)}</p>` : ""}</div></article>`
    )
    .join("")}</div>`;
  if (extras?.length) html += tagChips(extras);
  return html;
}

function flowBodyHtml(body) {
  if (!body) return "";
  if (String(body).includes("\n")) {
    return String(body)
      .split("\n")
      .map((line) => escapeHtml(line.trim()))
      .join("<br />");
  }
  return escapeHtml(body);
}

function flowStageGridHtml(steps, opts = {}) {
  const items = steps || [];
  if (!items.length) return "";
  const cols = opts.cols || processLayoutCols(items.length);
  const chipLimit = opts.chipLimit ?? 0;
  const variant = opts.variant || "flow";
  const cards = items
    .map((s) => {
      const chips =
        chipLimit && s.examples?.length ?
          `<ul class="bs-flow-stage-chips">${s.examples
            .slice(0, chipLimit)
            .map((e) => `<li>${escapeHtml(e)}</li>`)
            .join("")}</ul>`
        : "";
      return `<article class="bs-flow-stage-grid__item"><span class="bs-flow-stage-grid__n" aria-hidden="true">${escapeHtml(s.n)}</span><div class="bs-flow-stage-grid__copy"><h3>${escapeHtml(s.title)}</h3><p>${flowBodyHtml(s.body)}</p>${chips}</div></article>`;
    })
    .join("");
  return `<div class="bs-flow-stage-grid bs-flow-stage-grid--${variant}" data-cols="${cols}" data-variant="${escapeHtml(variant)}">${cards}</div>`;
}

function dataReportingFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { variant: "flow" });
}

function dataReportingProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function marketResearchFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function marketResearchProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function competitorAnalysisFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function competitorAnalysisProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function consumerResearchFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function consumerResearchProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function uxAuditFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function uxAuditProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function trendResearchFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function trendResearchProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function customProductFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function customProductProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function productLaunchFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function productLaunchProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function internalSystemFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function internalSystemProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function researchOutputMatrixFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--matrix">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "MATRIX")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-ca-matrix">
        <div class="bs-ca-matrix__head"><span></span><span>A</span><span>B</span><span>C</span><span>You</span></div>
        <div class="bs-ca-matrix__row"><span>Features</span><i class="is-y"></i><i class="is-y"></i><i class="is-p"></i><i class="is-n"></i></div>
        <div class="bs-ca-matrix__row"><span>Pricing</span><i class="is-p"></i><i class="is-y"></i><i class="is-y"></i><i class="is-p"></i></div>
        <div class="bs-ca-matrix__row"><span>Message</span><i class="is-y"></i><i class="is-p"></i><i class="is-n"></i><i class="is-y"></i></div>
      </div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputSegmentsFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--segments">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "SEGMENTS")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-cr-segments">
        <div class="bs-cr-segments__row is-on"><span>A</span><strong>Power users</strong><em>Speed · control</em></div>
        <div class="bs-cr-segments__row"><span>B</span><strong>New adopters</strong><em>Onboarding · trust</em></div>
        <div class="bs-cr-segments__row"><span>C</span><strong>Price-sensitive</strong><em>Value · clarity</em></div>
      </div>
      <div class="bs-cr-segments__themes"><span class="is-on">Onboarding</span><span>Pricing</span><span>Support</span><span>Gaps</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputAuditFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--audit">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "ISSUES")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-ux-issues">
        <div class="bs-ux-issues__row is-p1"><span>P1</span><strong>Checkout step unclear</strong><em>Checkout</em></div>
        <div class="bs-ux-issues__row is-p2"><span>P2</span><strong>Form label mismatch</strong><em>Signup</em></div>
        <div class="bs-ux-issues__row"><span>P3</span><strong>Empty state missing</strong><em>Dashboard</em></div>
      </div>
      <div class="bs-ux-issues__tags"><span class="is-on">Friction</span><span>IA</span><span>Mobile</span><span>Quick win</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputTrendsFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--trends">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "THEMES")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-tr-themes">
        <div class="bs-tr-themes__row is-rising"><span>↑</span><strong>AI-assisted workflows</strong><em>Rising</em></div>
        <div class="bs-tr-themes__row is-emerging"><span>◆</span><strong>Privacy-first UX</strong><em>Emerging</em></div>
        <div class="bs-tr-themes__row"><span>—</span><strong>Subscription fatigue</strong><em>Stable</em></div>
      </div>
      <div class="bs-tr-themes__horizons"><span class="is-on">Near-term</span><span>Mid-term</span><span>Watchlist</span><span>Opportunity</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputBlueprintFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--blueprint">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "BLUEPRINT")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-cp-modules">
        <div class="bs-cp-modules__row is-on"><span>01</span><strong>Core workflow</strong><em>Phase 1</em></div>
        <div class="bs-cp-modules__row is-on"><span>02</span><strong>Admin console</strong><em>Phase 1</em></div>
        <div class="bs-cp-modules__row"><span>03</span><strong>CRM sync</strong><em>Phase 2</em></div>
      </div>
      <div class="bs-cp-modules__layers"><span class="is-on">UX/UI</span><span>API</span><span class="is-on">Permissions</span><span>Deploy</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputLaunchFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--launch">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "CHECKLIST")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-pl-checks">
        <div class="bs-pl-checks__row is-done"><span>✓</span><strong>MVP core</strong><em>Product</em></div>
        <div class="bs-pl-checks__row is-run"><span>◐</span><strong>Launch landing</strong><em>Landing</em></div>
        <div class="bs-pl-checks__row"><span>○</span><strong>Analytics setup</strong><em>Ops</em></div>
      </div>
      <div class="bs-pl-checks__tags"><span class="is-on">Product</span><span class="is-on">Landing</span><span>Domain</span><span>QA</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputConsoleFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--console">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "OPS CONSOLE")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-is-console">
        <div class="bs-is-console__row is-run"><span>#128</span><strong>Budget approval</strong><em>Review</em></div>
        <div class="bs-is-console__row is-on"><span>#127</span><strong>Asset request</strong><em>Pending</em></div>
        <div class="bs-is-console__row"><span>#126</span><strong>Vendor onboarding</strong><em>Done</em></div>
      </div>
      <div class="bs-is-console__modules"><span class="is-on">Approval</span><span>Dashboard</span><span class="is-on">Admin</span><span>Report</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function buildServiceFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { chipLimit: 3, variant: "flow" });
}

function buildServiceProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function researchOutputScopeFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--scope">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "MVP SCOPE")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-mvp-scope">
        <div class="is-on"><span>CORE</span><strong>5</strong><em>Must ship</em></div>
        <div><span>NEXT</span><strong>3</strong><em>Post-launch</em></div>
        <div><span>LATER</span><strong>4</strong><em>Validate</em></div>
      </div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputResponsiveFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--responsive">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "RESPONSIVE")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-web-devices">
        <div class="bs-web-devices__desk"><span>Desktop</span><i></i><i></i><i></i></div>
        <div class="bs-web-devices__mob is-on"><span>Mobile</span><i></i><i></i></div>
      </div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputLandingFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--landing-page">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "LANDING")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-lp-sections">
        <div class="is-on"><span>Hero</span><em>Hook</em></div>
        <div class="is-on"><span>Value</span><em>Proof</em></div>
        <div><span>Features</span><em>Detail</em></div>
        <div class="is-run"><span>CTA</span><em>Convert</em></div>
      </div>
      <div class="bs-lp-ctas"><span class="is-on">Sign up</span><span>Demo</span><span>Contact</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputScreensFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--screens">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "APP SCREENS")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-app-screens">
        <div><span>01</span><strong>Onboard</strong></div>
        <div class="is-run"><span>02</span><strong>Home</strong></div>
        <div><span>03</span><strong>Action</strong></div>
      </div>
      <div class="bs-app-screens__tags"><span class="is-on">iOS</span><span class="is-on">Android</span><span>API</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputAiLoopFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--ailoop">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "AI LOOP")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-ai-loop">
        <div class="is-run"><span>AI</span><strong>Classify</strong><em>92%</em></div>
        <div class="is-on"><span>HITL</span><strong>Review</strong><em>Pending</em></div>
        <div><span>OUT</span><strong>Action</strong><em>Queued</em></div>
      </div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function researchOutputBrandFrame(copy, metricVals, label) {
  return `<div class="bs-dr-output__frame bs-dr-output__frame--brand">
    <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(label || "BRAND CONFIG")}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
    <div class="bs-dr-output__page">
      <div class="bs-wl-config">
        <div class="bs-wl-config__row"><span>Brand</span><strong>Your Brand</strong></div>
        <div class="bs-wl-config__row is-on"><span>Domain</span><strong>app.yourbrand.com</strong></div>
        <div class="bs-wl-config__row"><span>Modules</span><strong>6 active</strong></div>
      </div>
      <div class="bs-wl-config__mods"><span class="is-on">Inbox</span><span>Booking</span><span class="is-on">Dashboard</span></div>
      <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
        .slice(0, 4)
        .map(
          (m, i) =>
            `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function internalToolsProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function internalToolsFlowHtml(flowDetail) {
  if (!flowDetail?.length) return "";
  return flowStageGridHtml(flowDetail, { variant: "flow" });
}

function workflowStructureHtml(structureDetail) {
  if (!structureDetail?.length) return "";
  return flowStageGridHtml(structureDetail, { chipLimit: 3, variant: "flow" });
}

function workflowProcessHtml(processDetail) {
  return processStepsHtml(processDetail);
}

function workflowCapsHtml(caps) {
  return `<div class="bs-wfa-caps-grid">${(caps || [])
    .map((cap) => {
      const body = cap.body || "";
      const parts = body.includes("→") ? body.split("→").map((s) => s.trim()) : [];
      const flow =
        parts.length > 1 ?
          `<div class="bs-wfa-caps-grid__flow">${parts
            .map(
              (p, i) =>
                `${i ? '<i class="bs-wfa-caps-grid__conn"></i>' : ""}<span class="bs-wfa-caps-grid__chip${i === 1 ? " is-on" : ""}">${escapeHtml(p)}</span>`
            )
            .join("")}</div>`
        : `<p class="bs-wfa-caps-grid__desc">${flowBodyHtml(body)}</p>`;
      return `<article class="bs-wfa-caps-grid__item"><span class="bs-wfa-caps-grid__n">${escapeHtml(cap.n || "")}</span><h3>${escapeHtml(cap.title || "")}</h3>${flow}</article>`;
    })
    .join("")}</div>`;
}

function workflowAiSectionHtml(copy) {
  const examples = copy.aiExamples || [];
  if (!examples.length) return "";
  return `<div class="bs-wfa-ai-stack">
    <div class="bs-wfa-ai-split__viz" aria-hidden="true">
      <div class="bs-wfa-ai-split__head"><span>AI IN WORKFLOW</span><span class="bs-wfa-ai-split__live"><i></i> ON</span></div>
      <div class="bs-wfa-ai-split__nodes">
        <span class="is-in">Inquiry text</span><i></i><span class="is-on">Classify</span><i></i><span>Route</span>
      </div>
      <div class="bs-wfa-ai-split__out"><em>Priority</em><em>Summary</em><em>Draft reply</em></div>
    </div>
    <div class="bs-wfa-ai-grid">${examples
      .map((title, i) => {
        const [head, ...rest] = String(title).split(" — ");
        const sub = rest.join(" — ");
        return `<article class="bs-wfa-ai-grid__item"><span class="bs-wfa-ai-grid__n">${pad2(i + 1)}</span><h3>${escapeHtml(head)}</h3>${sub ? `<p>${escapeHtml(sub)}</p>` : ""}</article>`;
      })
      .join("")}</div>
  </div>`;
}

function workflowFlowVisualHtml(steps) {
  if (!steps?.length) return "";
  return `<div class="bs-it-flow-visual bs-wfa-flow-visual" aria-hidden="true">
    <div class="bs-it-flow-visual__frame">
      <div class="bs-it-flow-visual__head"><span>WORKFLOW STEPS</span><span class="bs-it-flow-visual__live"><i></i> LIVE</span></div>
      <div class="bs-it-flow-visual__track">${steps
        .map(
          (s, i) =>
            `${i ? '<i class="bs-it-flow-visual__conn"></i>' : ""}<div class="bs-it-flow-visual__step${i === 2 ? " is-on" : ""}"><span>${escapeHtml(s.n)}</span><strong>${escapeHtml(s.title)}</strong></div>`
        )
        .join("")}</div>
    </div>
  </div>`;
}

function workflowCasesHtml(cases) {
  return `<div class="bs-wf-cases bs-wf-cases--landing">${(cases || [])
    .map((c) => {
      const steps = c.steps || [];
      const active = Math.min(2, Math.max(0, Math.floor(steps.length / 2) - 1));
      const stepsHtml = steps
        .map(
          (s, i) =>
            `<li class="bs-wf-case-steps__item${i === active ? " is-on" : ""}"><span class="bs-wf-case-steps__n">${pad2(i + 1)}</span><span class="bs-wf-case-steps__t">${escapeHtml(s)}</span></li>`
        )
        .join("");
      return `<article class="bs-wf-cases__item">
        <p class="bs-wf-cases__k">CASE ${escapeHtml(c.n)}</p>
        <h3>${escapeHtml(c.t)}</h3>
        <ol class="bs-wf-case-steps">${stepsHtml}</ol>
      </article>`;
    })
    .join("")}</div>`;
}

function internalToolsExtensionsHtml(copy) {
  const aiExamples = copy.aiExamples || [];
  const autoExamples = copy.autoExamples || [];
  if (!aiExamples.length && !autoExamples.length) return "";

  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-it-ext-title"><div class="bs-inner">
    <p class="bs-eyebrow">EXTENSIONS</p>
    <h2 class="bs-title" id="bs-it-ext-title">${escapeHtml(copy.extSectionTitle || copy.aiTitle || "Extend with AI and automation")}</h2>
    <div class="bs-it-ext-grid">
      <article class="bs-it-ext-grid__col">
        <div class="bs-it-ext-grid__viz bs-it-ext-grid__viz--ai" aria-hidden="true">
          <div class="bs-it-ext-grid__head"><span>AI LAYER</span><span class="bs-it-ext-grid__live"><i></i> ON</span></div>
          <div class="bs-it-ext-grid__nodes">
            <span class="is-in">Request text</span><i></i><span class="is-on">Classify</span><i></i><span>Route</span>
          </div>
          <div class="bs-it-ext-grid__out"><em>Summary</em><em>Draft</em><em>Priority</em></div>
        </div>
        <p class="bs-eyebrow">${escapeHtml(copy.aiLabel || "AI EXTENSION")}</p>
        <h3>${escapeHtml(copy.aiTitle || "AI EXTENSION")}</h3>
        ${copy.aiLead ? `<p class="bs-it-ext-grid__lead">${escapeHtml(copy.aiLead)}</p>` : ""}
        ${tagChips(aiExamples)}
        ${copy.aiNote ? `<p class="bs-note">${escapeHtml(copy.aiNote)}</p>` : ""}
      </article>
      <article class="bs-it-ext-grid__col">
        <div class="bs-it-ext-grid__viz bs-it-ext-grid__viz--auto" aria-hidden="true">
          <div class="bs-it-ext-grid__head"><span>AUTOMATION</span><span>SYNC</span></div>
          <div class="bs-it-ext-grid__nodes">
            <span class="is-in">Status change</span><i></i><span class="is-on">Notify</span><i></i><span>Update</span>
          </div>
          <div class="bs-it-ext-grid__out"><em>Slack</em><em>Sheet</em><em>Email</em></div>
        </div>
        <p class="bs-eyebrow">${escapeHtml(copy.autoLabel || "AUTOMATION EXTENSION")}</p>
        <h3>${escapeHtml(copy.autoTitle || "AUTOMATION")}</h3>
        ${copy.autoLead ? `<p class="bs-it-ext-grid__lead">${escapeHtml(copy.autoLead)}</p>` : ""}
        ${tagChips(autoExamples)}
      </article>
    </div>
  </div></section>`;
}

function whoList(items) {
  return `<ol class="bs-who bs-who--roster" data-variant="roster">${items
    .map(
      (t, i) =>
        `<li class="bs-who__item"><span class="bs-who__n" aria-hidden="true">${pad2(i + 1)}</span><p class="bs-who__t">${escapeHtml(t)}</p></li>`
    )
    .join("")}</ol>`;
}

function parsePriceFactor(text) {
  const s = String(text).trim();
  const parts = s.split(/\s+—\s+/);
  if (parts.length >= 2) {
    return { label: parts[0].trim(), desc: parts.slice(1).join(" — ").trim() };
  }
  return { label: s, desc: "" };
}

function priceFactorItemHtml(f) {
  const { label, desc } = parsePriceFactor(f);
  if (desc) {
    return `<li class="bs-price__factor"><span class="bs-price__factor-k">${escapeHtml(label)}</span><span class="bs-price__factor-d">${escapeHtml(desc)}</span></li>`;
  }
  return `<li class="bs-price__factor"><span class="bs-price__factor-k">${escapeHtml(label)}</span></li>`;
}

function engagementSectionHtml(copy, timelines = [], opts = {}) {
  const id = opts.id || "bs-dr-engage-title";
  const sectionClass = opts.sectionClass || "bs-section bs-section--surface";
  const priceNameDefault = opts.priceNameDefault || "SERVICE";
  const factorLimit = opts.factorLimit || 8;
  const lead = opts.lead ?? copy.timeLead ?? copy.priceLead ?? "";
  const footnote = opts.footnote ?? "";
  const lang = copy._pageLang === "ko" || /[가-힣]/.test(String(copy.priceTitle || "")) ? "ko" : copy._pageLang || "en";
  const isKo = lang === "ko";

  const timelineValue =
    copy._timelineValue ||
    (timelines.length === 1 ? timelines[0].body || timelines[0].d || "" : "");

  // Studio-style TIMELINE (single estimate) or process rail (multiple packages)
  let timelineHtml = "";
  if (timelines.length === 1 || (timelineValue && timelines.length <= 1)) {
    const value = timelineValue || timelines[0]?.body || timelines[0]?.d || "";
    const timeTitle =
      copy.timeTitle || (isKo ? "예상 진행 기간" : "Estimated timeline");
    const timeLead =
      lead ||
      (isKo
        ? "표시된 기간은 기본 프로젝트 범위 기준입니다. 실제 일정은 범위와 요구사항에 따라 달라질 수 있습니다."
        : "The range shown is for a basic project scope. The actual schedule may vary with scope and requirements.");
    timelineHtml = `<section class="${sectionClass}" data-bs-reveal aria-labelledby="${id}-time"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">TIMELINE</p>
          <h2 class="bs-title" id="${id}-time">${escapeHtml(timeTitle)}</h2>
          <p class="bs-lead">${escapeHtml(timeLead)}</p>
        </div>
        <aside class="bs-dr-meta" aria-label="Timeline">
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">TIMELINE</p><p class="bs-dr-meta__v">${escapeHtml(value)}</p></div>
          <div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${isKo ? "기준" : "BASE"}</p><p class="bs-dr-meta__v">${isKo ? "기본 범위 프로젝트" : "Basic-scope project"}</p></div>
        </aside>
      </div>
    </div></section>`;
  } else if (timelines.length > 1) {
    timelineHtml = `<section class="${sectionClass}" data-bs-reveal aria-labelledby="${id}-time"><div class="bs-inner">
      <p class="bs-eyebrow">TIMELINE</p>
      <h2 class="bs-title" id="${id}-time">${escapeHtml(copy.timeTitle || (isKo ? "범위별 예상 기간" : "Timeline by scope"))}</h2>
      ${lead ? `<p class="bs-lead">${escapeHtml(lead)}</p>` : ""}
      <ol class="bs-process">${timelines
        .map(
          (t, i) =>
            `<li class="bs-process__item"><span class="bs-process__n">${escapeHtml(t.n || pad2(i + 1))}</span><h3>${escapeHtml(t.title || t.t || "")}</h3><p>${escapeHtml(t.body || t.d || "")}</p></li>`
        )
        .join("")}</ol>
    </div></section>`;
  }

  const factorsLabel =
    copy.priceFactorsLabel || (isKo ? "기본 범위" : "Basic scope");
  const priceHtml = copy.priceValue
    ? `<div class="bs-price bs-price--scope">
      <div class="bs-price__panel">
        <p class="bs-price__name">${escapeHtml(copy.priceName || priceNameDefault)}</p>
        <p class="bs-price__value">${escapeHtml(copy.priceValue)}</p>
        ${
          copy.priceNote
            ? `<p class="bs-price__note">${escapeHtml(copy.priceNote).replace(/\n/g, "<br />")}</p>`
            : ""
        }
      </div>
      <div class="bs-price__detail">
        <p class="bs-eyebrow">${escapeHtml(factorsLabel)}</p>
        <ul class="bs-price__factors">${(copy.priceFactors || [])
          .slice(0, factorLimit)
          .map((f) => priceFactorItemHtml(f))
          .join("")}</ul>
      </div>
    </div>`
    : "";

  const priceSection = copy.priceValue
    ? `<section class="${sectionClass}" data-bs-reveal aria-labelledby="${id}"><div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.priceLabel || "PROJECT SCOPE")}</p>
    <h2 class="bs-title" id="${id}">${escapeHtml(copy.priceTitle || copy.timeTitle || "")}</h2>
    ${priceHtml}
    ${footnote ? `<p class="bs-note">${escapeHtml(footnote)}</p>` : ""}
  </div></section>`
    : "";

  return `${timelineHtml}${priceSection}`;
}

function faqHtml(faqs) {
  return `<div class="bs-faq">${faqs
    .map(
      (f, i) => `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="bs-faq-q-${i}" aria-controls="bs-faq-a-${i}">
        <span>${escapeHtml(f.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="bs-faq-a-${i}" role="region" aria-labelledby="bs-faq-q-${i}"><div><p>${escapeHtml(f.a)}</p></div></div>
    </div>`
    )
    .join("")}</div>`;
}

function relatedHtml(page, copy, copies) {
  const links = (page.related || [])
    .map((slug) => {
      const rel = bySlug(slug);
      const c = copies[slug];
      if (!rel || !c) return "";
      return `<a class="bs-related__link" href="${serviceHref(page, rel)}">
        <span><span class="bs-related__kicker">NEXT SERVICE</span><span class="bs-related__name">${escapeHtml(c.navLabel || c.eyebrow)}</span></span>
        <span class="bs-related__go" aria-hidden="true">→</span>
      </a>`;
    })
    .join("");
  return `<section class="bs-section" data-bs-reveal aria-labelledby="bs-related-title">
    <div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.relatedTitle || "RELATED SERVICES")}</p>
      <h2 class="bs-title" id="bs-related-title">${escapeHtml(copy.relatedTitle || "Related")}</h2>
      <div class="bs-related">${links}</div>
      <a class="bs-related__all" href="${relPrefix(page)}">${escapeHtml(copy.exploreAll || "Explore all services →")}</a>
    </div>
  </section>`;
}

function railHtml(steps, className = "bs-rail") {
  return `<div class="${className}" aria-hidden="true">${steps
    .map(
      (s, i) =>
        `${i ? '<span class="bs-rail__conn"></span>' : ""}<div class="bs-rail__step"><span class="bs-rail__n">${escapeHtml(s.n || pad2(i + 1))}</span><span class="bs-rail__t">${escapeHtml(s.title)}</span></div>`
    )
    .join("")}</div>`;
}

/* ——— Mid-page extras ——— */
function mvpExtras(copy) {
  const scopeItems = copy.scopeItems?.length
    ? copy.scopeItems
    : [
        { key: "CORE", title: "CORE", body: "Must-have features for first release" },
        { key: "NEXT", title: "NEXT", body: "Add after launch" },
        { key: "LATER", title: "LATER", body: "Decide after validation" },
      ];
  const buildGridRaw = copy.buildGrid?.length
    ? copy.buildGrid
    : [
        { tag: "WEB", title: "Web MVP", body: "A core flow people can use in the browser." },
        { tag: "APP", title: "Mobile App MVP", body: "Habits and alerts that need mobile." },
        { tag: "OPS", title: "Internal Tool", body: "Daily ops software for your team." },
        { tag: "AI", title: "AI Product", body: "AI that cuts repeat work." },
        { tag: "EXP", title: "Prototype", body: "A clickable demo — fast and sharp." },
        { tag: "GO", title: "Landing + Product", body: "Landing and product entry together." },
      ];
  const buildGrid = buildGridRaw.map((item, i) => {
    if (typeof item === "string") {
      return { tag: pad2(i + 1), title: item, body: "" };
    }
    return {
      tag: item.tag || pad2(i + 1),
      title: item.title || "",
      body: item.body || "",
    };
  });

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-scope-title"><div class="bs-inner">
    <p class="bs-eyebrow">PRODUCT SCOPE</p>
    <h2 class="bs-title" id="bs-scope-title">${brHeadline(copy.scopeTitle || "You don't need to build everything first.")}</h2>
    ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
    <div class="bs-scope">${scopeItems
      .map(
        (s) =>
          `<article class="bs-scope__col"><p class="bs-scope__k">${escapeHtml(s.title || s.key || "")}</p><p class="bs-scope__b">${escapeHtml(s.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--build" data-bs-reveal aria-labelledby="bs-buildgrid-title"><div class="bs-inner">
    <div class="bs-build-head">
      <div class="bs-build-head__copy">
        <p class="bs-eyebrow">${escapeHtml(copy.buildGridEyebrow || "CAPABILITY")}</p>
        <h2 class="bs-title" id="bs-buildgrid-title">${escapeHtml(copy.buildGridTitle || "WHAT WE CAN BUILD")}</h2>
        ${copy.buildGridLead ? `<p class="bs-lead">${escapeHtml(copy.buildGridLead)}</p>` : ""}
      </div>
      <p class="bs-build-head__meta" aria-hidden="true"><span class="bs-mono">${escapeHtml(copy.buildGridMeta || `${pad2(buildGrid.length)} FORMS`)}</span></p>
    </div>
    <div class="bs-build-grid" role="list">${buildGrid
      .map(
        (item, i) =>
          `<article class="bs-build-grid__item${i === 0 ? " is-lead" : ""}" role="listitem">
            <div class="bs-build-grid__top">
              <span class="bs-build-grid__n">${pad2(i + 1)}</span>
              <span class="bs-build-grid__tag">${escapeHtml(item.tag)}</span>
            </div>
            <div class="bs-build-grid__viz" aria-hidden="true" data-viz="${escapeHtml(String(item.tag).toLowerCase())}"></div>
            <h3 class="bs-build-grid__t">${escapeHtml(item.title)}</h3>
            ${item.body ? `<p class="bs-build-grid__b">${escapeHtml(item.body)}</p>` : ""}
          </article>`
      )
      .join("")}</div>
  </div></section>`;

  return html;
}

function webExtras(copy) {
  const defaultTypes = [
    { n: "01", title: "Company site", body: "Clear brand and service story for your team." },
    { n: "02", title: "Brand site", body: "Worldview and tone first, then conversion." },
    { n: "03", title: "Service landing", body: "One product, one value, one CTA." },
    { n: "04", title: "Portfolio / case", body: "Work and process shown with intent." },
    { n: "05", title: "Inquiry hub", body: "Hire, partner, and contact in one place." },
  ];
  const types = (copy.types?.length ? copy.types : defaultTypes).map((t, i) => ({
    ...t,
    n: t.n || pad2(i + 1),
  }));

  const railSteps = [
    { n: "01", title: "STRATEGY" },
    { n: "02", title: "IA" },
    { n: "03", title: "UI/UX" },
    { n: "04", title: "DEVELOPMENT" },
    { n: "05", title: "RESPONSIVE" },
    { n: "06", title: "QA" },
    { n: "07", title: "DEPLOYMENT" },
  ];

  const quality =
    copy.quality?.length >= 4
      ? copy.quality
      : [
          { title: "Hierarchy", body: "Brand and one sentence read first." },
          { title: "Consistency", body: "Rules hold across every page." },
          { title: "Performance", body: "Light surfaces, fast content." },
          { title: "Mobile-first", body: "CTA and copy never collapse." },
          { title: "Operable", body: "Built for post-launch edits." },
        ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-types-title"><div class="bs-inner">
    <p class="bs-eyebrow">WHAT WE BUILD</p>
    <h2 class="bs-title" id="bs-types-title">${escapeHtml(copy.typesTitle || "Website types")}</h2>
    <div class="bs-types">${types
      .map(
        (t) =>
          `<article class="bs-types__item"><span class="bs-types__n">${escapeHtml(t.n)}</span><div class="bs-types__body"><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.body)}</p></div></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-resp-title"><div class="bs-inner">
    <p class="bs-eyebrow">RESPONSIVE</p>
    <h2 class="bs-title" id="bs-resp-title">${escapeHtml(copy.responsiveTitle || "RESPONSIVE BY DEFAULT")}</h2>
    ${
      copy.responsiveLead
        ? `<p class="bs-lead">${escapeHtml(copy.responsiveLead)}</p>`
        : ""
    }
    <div class="bs-responsive" aria-hidden="true">
      <div class="bs-responsive__frame bs-responsive__frame--desk">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">DESKTOP</span><div class="bs-responsive__bar"><span></span><span></span><span></span></div></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>Menu</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols"><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="bs-responsive__frame bs-responsive__frame--tab">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">TABLET</span><div class="bs-responsive__bar"><span></span><span></span><span></span></div></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>≡</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols bs-responsive__cols--2"><i></i><i></i></div>
        </div>
      </div>
      <div class="bs-responsive__frame bs-responsive__frame--mob">
        <div class="bs-responsive__chrome"><span class="bs-responsive__label">MOBILE</span></div>
        <div class="bs-responsive__page">
          <div class="bs-responsive__top"><strong>NEW PRODUCT</strong><em>≡</em></div>
          <p class="bs-responsive__hero">Build something people want to use.</p>
          <span class="bs-responsive__cta">Explore →</span>
          <div class="bs-responsive__cols bs-responsive__cols--1"><i></i><i></i></div>
        </div>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-rail-title"><div class="bs-inner">
    <p class="bs-eyebrow">FROM STRUCTURE TO LAUNCH</p>
    <h2 class="bs-title" id="bs-rail-title">${escapeHtml(copy.railTitle || "FROM STRUCTURE TO LAUNCH")}</h2>
    ${railHtml(railSteps)}
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-quality-title"><div class="bs-inner">
    <p class="bs-eyebrow">QUALITY</p>
    <h2 class="bs-title" id="bs-quality-title">${escapeHtml(copy.qualityTitle || "BUILT FOR THE REAL WEB")}</h2>
    <div class="bs-quality">${quality
      .map(
        (q, i) =>
          `<article class="bs-quality__item"><span class="bs-quality__n">${pad2(i + 1)}</span><h3>${escapeHtml(q.title)}</h3><p>${escapeHtml(q.body)}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  return html;
}

function appExtras(copy) {
  const processSteps =
    copy.processItems?.length >= 7
      ? copy.processItems.slice(0, 7)
      : [
          ...(copy.processItems || []),
          ...[
            { n: "01", title: "Product definition", body: "Who it's for and what ships first." },
            { n: "02", title: "Flow & UI", body: "Onboarding to core task." },
            { n: "03", title: "Shared product layer", body: "One experience across platforms." },
            { n: "04", title: "Native polish", body: "iOS and Android patterns." },
            { n: "05", title: "API & data", body: "Auth, sync, notifications." },
            { n: "06", title: "Test builds", body: "Real-device validation." },
            { n: "07", title: "Store release", body: "Listing, review, launch." },
          ].slice(copy.processItems?.length || 0),
        ].slice(0, 7);

  const screens = [
    { label: "01", title: "Onboarding" },
    { label: "02", title: "Home" },
    { label: "03", title: "Detail" },
    { label: "04", title: "Premium" },
    { label: "05", title: "Profile" },
  ];
  const preview = copy.previewScreens?.length >= 5 ? copy.previewScreens.slice(0, 5) : screens;

  const caps = copy.capabilityChips?.length
    ? copy.capabilityChips
    : [
        "Authentication",
        "Notifications",
        "Subscription",
        "API",
        "Analytics",
        "Localization",
        "Dark Mode",
        "Store Release",
      ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-plat-title"><div class="bs-inner">
    <p class="bs-eyebrow">PLATFORM</p>
    <h2 class="bs-title" id="bs-plat-title">${escapeHtml(copy.platformTitle || "ONE PRODUCT. TWO PLATFORMS.")}</h2>
    <div class="bs-plat" aria-hidden="true">
      <div class="bs-plat__side"><span>iOS</span></div>
      <div class="bs-plat__mid"><strong>SHARED PRODUCT EXPERIENCE</strong><p>One product logic. Platform-native feel.</p></div>
      <div class="bs-plat__side"><span>Android</span></div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal id="process" aria-labelledby="bs-app-process-title"><div class="bs-inner">
    <p class="bs-eyebrow">PROCESS</p>
    <h2 class="bs-title" id="bs-app-process-title">${escapeHtml(copy.processTitle || "FROM FIRST SCREEN TO STORE RELEASE")}</h2>
    ${processList(
      processSteps.map((s, i) => ({
        n: s.n || pad2(i + 1),
        title: s.title,
        body: s.body || "",
      }))
    )}
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-screens-title"><div class="bs-inner">
    <p class="bs-eyebrow">PREVIEW</p>
    <h2 class="bs-title" id="bs-screens-title">${escapeHtml(copy.screensTitle || "APP EXPERIENCE PREVIEW")}</h2>
    <div class="bs-screens">${preview
      .map(
        (s, i) =>
          `<article class="bs-screens__item"><p>${escapeHtml(s.label || pad2(i + 1))}</p><div class="bs-screens__frame" aria-hidden="true"><span class="bs-screens__title-bar"></span><span></span><span></span><span style="width:70%"></span><div class="bs-screens__block"></div></div><strong>${escapeHtml(s.title)}</strong></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-caps-title"><div class="bs-inner">
    <p class="bs-eyebrow">CAPABILITY</p>
    <h2 class="bs-title" id="bs-caps-title">${escapeHtml(copy.capabilityTitle || "Built-in product capabilities")}</h2>
    ${chips(caps)}
  </div></section>`;

  return html;
}

function aiExtras(copy) {
  const defaultAreas = [
    { n: "01", title: "Customer inquiry", body: "Classify, draft, route." },
    { n: "02", title: "Review analysis", body: "Theme clusters and insights." },
    { n: "03", title: "Content drafts", body: "Tone-matched first drafts." },
    { n: "04", title: "Document summary", body: "Decision-ready briefs." },
    { n: "05", title: "Internal search", body: "Answers with sources." },
    { n: "06", title: "Ops automation", body: "Reports, alerts, cleanup." },
  ];
  const useCases = (copy.areas?.length ? copy.areas : defaultAreas).map((a, i) => ({
    ...a,
    n: a.n || pad2(i + 1),
  }));

  const before = copy.beforeSteps || [
    "Requests arrive across channels",
    "Humans classify and draft everything",
    "Answers drift by person",
    "Status is visible too late",
  ];
  const after = copy.afterSteps || [
    "Requests classify automatically",
    "Drafts and summaries appear first",
    "Humans handle review and exceptions",
    "Outcomes stay in the record",
  ];

  const loopSteps = copy.loopSteps?.length
    ? copy.loopSteps
    : [
        { n: "01", title: "AI PROCESS", body: "" },
        { n: "02", title: "CONFIDENCE CHECK", body: "" },
        { n: "03", title: "HUMAN REVIEW", body: "" },
        { n: "04", title: "APPROVED", body: "" },
        { n: "05", title: "ACTION", body: "" },
      ];

  const humanItems = copy.humanItems?.length
    ? copy.humanItems
    : ["Final judgment", "Exceptions", "Brand tone", "Policy", "Quality bar"];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-compare-title"><div class="bs-inner">
    <p class="bs-eyebrow">COMPARE</p>
    <h2 class="bs-title" id="bs-compare-title">${escapeHtml(copy.compareTitle || "BEFORE vs AFTER")}</h2>
    ${copy.compareLead ? `<p class="bs-lead">${escapeHtml(copy.compareLead)}</p>` : ""}
    <div class="bs-compare">
      <div class="bs-compare__col">
        <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeTitle || "BEFORE")}</h3></div>
        <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
      </div>
      <div class="bs-compare__col is-after">
        <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterTitle || "AFTER")}</h3></div>
        <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-usecases bs-section--surface" data-bs-reveal aria-labelledby="bs-areas-title">
    <div class="bs-usecases__head bs-inner">
      <p class="bs-eyebrow">USE CASES</p>
      <h2 class="bs-title" id="bs-areas-title">${escapeHtml(copy.areasTitle || "AUTOMATION USE CASES")}</h2>
      ${copy.areasLead ? `<p class="bs-lead">${escapeHtml(copy.areasLead)}</p>` : ""}
    </div>
    ${useCasesHtml(useCases)}
  </section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-loop-title"><div class="bs-inner">
    <p class="bs-eyebrow">GOVERNANCE</p>
    <h2 class="bs-title" id="bs-loop-title">${escapeHtml(copy.humanTitle || "HUMAN IN THE LOOP")}</h2>
    ${copy.humanLead ? `<p class="bs-lead">${escapeHtml(copy.humanLead)}</p>` : ""}
    <div class="bs-loop" aria-hidden="true">${loopSteps
      .map(
        (s, i) =>
          `<div class="bs-loop__step"><span class="bs-loop__n">${escapeHtml(s.n || pad2(i + 1))}</span><strong class="bs-loop__t">${escapeHtml(s.title)}</strong>${s.body ? `<p class="bs-loop__b">${escapeHtml(s.body)}</p>` : ""}</div>`
      )
      .join("")}</div>
    <div class="bs-human">
      <p class="bs-human__k">${escapeHtml(copy.humanLabel || "STAYS HUMAN")}</p>
      <ul class="bs-human__list">${humanItems.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-status-title"><div class="bs-inner">
    <p class="bs-eyebrow">STATUS</p>
    <h2 class="bs-title" id="bs-status-title">${escapeHtml(copy.statusTitle || "WORKFLOW STATUS")}</h2>
    <div class="bs-status">
      <div class="bs-status__top">
        <p class="bs-demo__badge">DEMO DATA</p>
        <span class="bs-status__live"><i></i> RUNNING</span>
      </div>
      <div class="bs-status__grid">
        <div class="bs-status__cell"><p class="bs-demo__k">STATUS</p><p class="bs-demo__v">RUNNING</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">TASKS PROCESSED</p><p class="bs-demo__v">128</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">NEEDS REVIEW</p><p class="bs-demo__v">6</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">AUTOMATION</p><p class="bs-demo__v">ACTIVE</p></div>
        <div class="bs-status__cell"><p class="bs-demo__k">LAST RUN</p><p class="bs-demo__v">JUST NOW</p></div>
      </div>
      <div class="bs-status__queue" aria-hidden="true">
        <div class="bs-status__row"><span class="bs-status__id">#128</span><span>Refund inquiry draft</span><em class="is-review">REVIEW</em></div>
        <div class="bs-status__row"><span class="bs-status__id">#127</span><span>Review theme cluster</span><em class="is-done">DONE</em></div>
        <div class="bs-status__row"><span class="bs-status__id">#126</span><span>Help article outline</span><em class="is-run">RUNNING</em></div>
      </div>
    </div>
  </div></section>`;

  return html;
}

function whiteLabelExtras(copy) {
  const howDefaults = [
    { n: "01", title: "Base", body: "Choose a validated product foundation." },
    { n: "02", title: "Brand", body: "Logo, color, type, and tone." },
    { n: "03", title: "Configure", body: "Turn modules on or off." },
    { n: "04", title: "Launch", body: "Ship and hand over operations." },
  ];
  const how = (copy.how?.length ? copy.how : howDefaults).map((h, i) => ({
    ...h,
    n: h.n || pad2(i + 1),
  }));

  const customAreas = (
    copy.customAreas?.length
      ? copy.customAreas
      : [
          { n: "01", title: "BRAND", body: copy.customItems?.[0] || "Logo, color, typography" },
          { n: "02", title: "PRODUCT", body: copy.customItems?.[2] || "Modules and workflows" },
          { n: "03", title: "CONTENT", body: copy.customItems?.[1] || "Menus, copy, media" },
          { n: "04", title: "SYSTEM", body: copy.customItems?.[5] || "Domain, email, permissions" },
        ]
  ).map((c, i) => ({ ...c, n: c.n || pad2(i + 1) }));

  const u = copy.useCase || {};
  const features = u.features || ["Inquiry inbox", "Booking", "CRM light", "Admin dashboard"];
  const baseBody =
    copy.foundationBaseBody || "Shared product core, proven flows, admin and data model.";
  const brandBody =
    copy.foundationBrandBody || "Identity, domain, features, and content that feel like yours.";

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-found-title"><div class="bs-inner">
    <p class="bs-eyebrow">FOUNDATION</p>
    <h2 class="bs-title" id="bs-found-title">${escapeHtml(copy.foundationTitle || "ONE FOUNDATION. YOUR EXPERIENCE.")}</h2>
    ${copy.foundationLead ? `<p class="bs-lead">${escapeHtml(copy.foundationLead)}</p>` : ""}
    <div class="bs-foundation">
      <div class="bs-foundation__col">
        <div class="bs-foundation__head"><span>01</span><p class="bs-foundation__k">${escapeHtml(copy.foundationBaseLabel || "BASE SYSTEM")}</p></div>
        <p>${escapeHtml(baseBody)}</p>
        <ul class="bs-foundation__tags"><li>Core flows</li><li>Admin</li><li>Data model</li></ul>
      </div>
      <div class="bs-foundation__col is-brand">
        <div class="bs-foundation__head"><span>02</span><p class="bs-foundation__k">${escapeHtml(copy.foundationBrandLabel || "YOUR BRAND")}</p></div>
        <p>${escapeHtml(brandBody)}</p>
        <ul class="bs-foundation__tags"><li>Identity</li><li>Domain</li><li>Modules</li></ul>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-custom-title"><div class="bs-inner">
    <p class="bs-eyebrow">CUSTOMIZE</p>
    <h2 class="bs-title" id="bs-custom-title">${escapeHtml(copy.customTitle || "Customize four areas")}</h2>
    ${copy.customLead ? `<p class="bs-lead">${escapeHtml(copy.customLead)}</p>` : ""}
    <div class="bs-config">${customAreas
      .map(
        (c) =>
          `<article class="bs-config__item"><span class="bs-config__n">${escapeHtml(c.n)}</span><strong>${escapeHtml(c.title)}</strong><span>${escapeHtml(c.body || "")}</span></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-how-title"><div class="bs-inner">
    <p class="bs-eyebrow">HOW IT WORKS</p>
    <h2 class="bs-title" id="bs-how-title">${escapeHtml(copy.howTitle || "How it works")}</h2>
    ${copy.howLead ? `<p class="bs-lead">${escapeHtml(copy.howLead)}</p>` : ""}
    <div class="bs-how">${how
      .map(
        (h) =>
          `<article class="bs-how__item"><span class="bs-how__n">${escapeHtml(h.n)}</span><h3>${escapeHtml(h.title)}</h3><p>${escapeHtml(h.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-cfg-title"><div class="bs-inner">
    <p class="bs-eyebrow">DEMO</p>
    <h2 class="bs-title" id="bs-cfg-title">${escapeHtml(copy.useCaseTitle || "Configuration")}</h2>
    <div class="bs-configurator">
      <div class="bs-configurator__top">
        <p class="bs-demo__badge">DEMO CONFIGURATION</p>
        <span class="bs-configurator__ready"><i></i> ${escapeHtml(u.status || "READY TO CUSTOMIZE")}</span>
      </div>
      <div class="bs-configurator__grid">
        <div class="bs-configurator__cell"><p class="bs-demo__k">PRODUCT</p><p class="bs-demo__v">${escapeHtml(u.base || "Operations Suite")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">BRAND</p><p class="bs-demo__v">${escapeHtml(u.brand || "Your Brand")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">PRIMARY COLOR</p><p class="bs-demo__v bs-configurator__swatch"><i></i> ${escapeHtml(u.color || "#1F1F1F")}</p></div>
        <div class="bs-configurator__cell bs-configurator__cell--wide"><p class="bs-demo__k">FEATURES</p><ul class="bs-configurator__list">${features.map((f) => `<li><span>✓</span>${escapeHtml(f)}</li>`).join("")}</ul></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">DOMAIN</p><p class="bs-demo__v">${escapeHtml(u.domain || "app.yourbrand.com")}</p></div>
        <div class="bs-configurator__cell"><p class="bs-demo__k">STATUS</p><p class="bs-demo__v">${escapeHtml(u.status || "READY TO CUSTOMIZE")}</p></div>
      </div>
      <div class="bs-configurator__preview" aria-hidden="true">
        <div class="bs-configurator__app">
          <div class="bs-configurator__appbar"><strong>${escapeHtml(u.brand || "Your Brand")}</strong><em>Admin</em></div>
          <div class="bs-configurator__appbody">
            <i></i><i></i><i></i>
          </div>
        </div>
        <p class="bs-configurator__hint">${escapeHtml(copy.configHint || "Same foundation · your brand surface")}</p>
      </div>
    </div>
  </div></section>`;

  if (copy.benefits?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-benefits-title"><div class="bs-inner">
      <p class="bs-eyebrow">OUTCOME</p>
      <h2 class="bs-title" id="bs-benefits-title">${escapeHtml(copy.benefitsTitle || "What to expect")}</h2>
      <ol class="bs-benefits">${copy.benefits
        .map(
          (t, i) =>
            `<li class="bs-benefits__item"><span class="bs-benefits__n">${pad2(i + 1)}</span><p>${escapeHtml(t)}</p></li>`
        )
        .join("")}</ol>
    </div></section>`;
  }

  return html;
}

function designExtras(copy) {
  const defaultServices = [
    { n: "01", title: "Brand Identity", body: "Logo system, color, type." },
    { n: "02", title: "Product UI/UX", body: "Flows and key screens." },
    { n: "03", title: "Design System", body: "Reusable components." },
    { n: "04", title: "Landing", body: "Marketing surfaces." },
    { n: "05", title: "UX improvement", body: "Onboarding and conversion." },
    { n: "06", title: "Handoff", body: "Specs for build." },
  ];
  const designItems = (copy.services?.length ? copy.services : defaultServices).map((s, i) => ({
    ...s,
    n: s.n || pad2(i + 1),
  }));

  const railSteps = (
    copy.process2?.length
      ? copy.process2
      : ["Research & goals", "IA / user flow", "Wireframe", "UI design", "Prototype review", "System & handoff"]
  ).map((t, i) => ({
    n: pad2(i + 1),
    title: typeof t === "string" ? t.toUpperCase() : String(t.title || t).toUpperCase(),
  }));

  const pillars = copy.brandPillars?.length
    ? copy.brandPillars
    : [
        { n: "01", title: "IDENTITY", body: "Logo, tone, and recognition." },
        { n: "02", title: "PRODUCT", body: "Flows that complete the job." },
        { n: "03", title: "INTERFACE", body: "Components and visual rules." },
        { n: "04", title: "EXPERIENCE", body: "One coherent product feel." },
      ];

  let html = "";
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-brandgrid-title"><div class="bs-inner">
    <p class="bs-eyebrow">SYSTEM</p>
    <h2 class="bs-title" id="bs-brandgrid-title">${escapeHtml(copy.brandGridTitle || "BRAND IS A SYSTEM")}</h2>
    ${copy.brandGridLead ? `<p class="bs-lead">${escapeHtml(copy.brandGridLead)}</p>` : ""}
    <div class="bs-brand-grid">${pillars
      .map(
        (p, i) =>
          `<article class="bs-brand-grid__item"><span class="bs-brand-grid__n">${escapeHtml(p.n || pad2(i + 1))}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dserv-title"><div class="bs-inner">
    <p class="bs-eyebrow">WHAT WE DESIGN</p>
    <h2 class="bs-title" id="bs-dserv-title">${escapeHtml(copy.servicesTitle || "What we design")}</h2>
    ${copy.servicesLead ? `<p class="bs-lead">${escapeHtml(copy.servicesLead)}</p>` : ""}
    <div class="bs-design-scope">${designItems
      .map(
        (s) =>
          `<article class="bs-design-scope__item"><span class="bs-design-scope__n">${escapeHtml(s.n)}</span><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.body || "")}</p></article>`
      )
      .join("")}</div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-drail-title"><div class="bs-inner">
    <p class="bs-eyebrow">PROCESS</p>
    <h2 class="bs-title" id="bs-drail-title">${escapeHtml(copy.processTitle2 || "FROM IDEA TO VISUAL SYSTEM")}</h2>
    ${copy.process2Lead ? `<p class="bs-lead">${escapeHtml(copy.process2Lead)}</p>` : ""}
    ${railHtml(railSteps, "bs-rail bs-rail--design")}
  </div></section>`;

  html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-lib-title"><div class="bs-inner">
    <p class="bs-eyebrow">LIBRARY</p>
    <h2 class="bs-title" id="bs-lib-title">${escapeHtml(copy.systemTitle || "Component Library")}</h2>
    ${copy.systemLead ? `<p class="bs-lead">${escapeHtml(copy.systemLead)}</p>` : ""}
    <div class="bs-library" aria-hidden="true">
      <div class="bs-library__top">
        <p class="bs-demo__badge">COMPONENT PREVIEW</p>
        <span class="bs-library__live"><i></i> SYSTEM</span>
      </div>
      <div class="bs-library__grid">
        <div class="bs-library__col">
          <p class="bs-library__k">BUTTONS</p>
          <span class="bs-library__btn is-fill">Primary</span>
          <span class="bs-library__btn is-line">Secondary</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">INPUTS</p>
          <span class="bs-library__input">Email</span>
          <span class="bs-library__input is-focus">Focused</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">TYPE</p>
          <span class="bs-library__type-lg">Display</span>
          <span class="bs-library__type-sm">Body / Caption</span>
        </div>
        <div class="bs-library__col">
          <p class="bs-library__k">SPACING</p>
          <div class="bs-library__space"><i style="width:25%"></i><i style="width:50%"></i><i style="width:75%"></i><i style="width:100%"></i></div>
        </div>
      </div>
    </div>
  </div></section>`;

  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-ba-title"><div class="bs-inner">
    <p class="bs-eyebrow">CONCEPT</p>
    <h2 class="bs-title" id="bs-ba-title">${escapeHtml(copy.beforeAfterTitle || "Before / After")}</h2>
    ${copy.beforeAfterLead ? `<p class="bs-lead">${escapeHtml(copy.beforeAfterLead)}</p>` : ""}
    <div class="bs-ba">
      <div class="bs-ba__col">
        <div class="bs-ba__head"><span>01</span><p class="bs-ba__label">${escapeHtml(copy.beforeLabel || "BEFORE")}</p></div>
        <div class="bs-ba__mock is-before" aria-hidden="true">
          <div class="bs-ba__noise"></div>
          <div class="bs-ba__noise"></div>
          <div class="bs-ba__noise is-cta"></div>
          <div class="bs-ba__noise is-cta"></div>
        </div>
        <p class="bs-ba__note">${escapeHtml(copy.beforeNote || "")}</p>
      </div>
      <div class="bs-ba__col">
        <div class="bs-ba__head"><span>02</span><p class="bs-ba__label">${escapeHtml(copy.afterLabel || "AFTER")}</p></div>
        <div class="bs-ba__mock is-after" aria-hidden="true">
          <strong>NEW PRODUCT</strong>
          <p>One clear action.</p>
          <span>Get started →</span>
        </div>
        <p class="bs-ba__note">${escapeHtml(copy.afterNote || "")}</p>
      </div>
    </div>
  </div></section>`;

  const timelines = (copy.timelines || []).map((t) => ({
    n: t.n,
    title: t.t || t.title,
    body: t.d || t.body,
  }));
  html += engagementSectionHtml(copy, timelines, {
    id: "bs-design-engage-title",
    priceNameDefault: "DESIGN & BRANDING",
  });

  return html;
}

function dataReportingExtras(copy) {
  const overview = copy.overviewBody || [];
  const problems = (copy.problems || []).map((p) => ({
    n: p.n,
    title: p.t,
    body: p.d,
  }));
  const caps = (copy.caps || []).map((cap, i) => ({
    n: pad2(i + 1),
    title: cap.t,
    body: cap.d,
  }));
  const useCases = (copy.useCases || []).map((u, i) => ({
    n: pad2(i + 1),
    title: u.t,
    body: u.d,
    tag: u.tag || "",
  }));
  const flowRail = (copy.flow || []).map((f) => ({ n: f.n, title: f.t }));
  const flowDetail = (copy.flow || []).map((f) => ({ n: f.n, title: f.t, body: f.d }));
  const timelines = (copy.timelines || []).map((t, i) => ({
    title: t.t,
    body: t.d,
    n: pad2(i + 1),
  }));
  const sourcePreview = (copy.sources || []).slice(0, 6);
  const reportPreview = (copy.reportItems || []).slice(0, 6);
  const metricVals = ["₩12.4M", "284", "1,842", "4.2%", "68%", "92%"];
  const before = copy.before || [];
  const after = copy.after || [];

  let html = "";

  /* OVERVIEW — editorial statement + meta strip */
  if (overview.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(copy.overviewLabel || "OVERVIEW")}</p>
          <h2 class="bs-title" id="bs-dr-overview-title">${brHeadline(copy.overviewTitle || "")}</h2>
          <div class="bs-overview">${overview.map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p)}</p>`).join("")}</div>
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${(copy.meta || [])
          .map(
            (m) =>
              `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
          )
          .join("")}</aside>
      </div>
    </div></section>`;
  }

  if (problems.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-problems-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.problemsLabel || "PROBLEMS")}</p>
      <h2 class="bs-title" id="bs-dr-problems-title">${escapeHtml(copy.problemsTitle || "")}</h2>
      ${areasHtml(problems, "signal")}
    </div></section>`;
  }

  if (before.length || after.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-compare-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.baLabel || "BEFORE / AFTER")}</p>
      <h2 class="bs-title" id="bs-dr-compare-title">${brHeadline(copy.baTitle || "BEFORE vs AFTER")}</h2>
      <div class="bs-compare">
        <div class="bs-compare__col">
          <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeLabel || "BEFORE")}</h3></div>
          <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
        <div class="bs-compare__col is-after">
          <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterLabel || "AFTER")}</h3></div>
          <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
      </div>
    </div></section>`;
  }

  if (caps.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-caps-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.capsLabel || "CAPABILITIES")}</p>
      <h2 class="bs-title" id="bs-dr-caps-title">${escapeHtml(copy.capsTitle || "")}</h2>
      ${areasHtml(caps, "caps")}
    </div></section>`;
  }

  /* USE CASES — area cards like AI page */
  if (useCases.length) {
    html += `<section class="bs-section bs-usecases" data-bs-part="usecases" data-bs-reveal aria-labelledby="bs-dr-areas-title">
      <div class="bs-usecases__head bs-inner">
        <p class="bs-eyebrow">${escapeHtml(copy.useLabel || "USE CASES")}</p>
        <h2 class="bs-title" id="bs-dr-areas-title">${escapeHtml(copy.useTitle || "")}</h2>
        ${copy.useBadge ? `<p class="bs-mono bs-dr-badge">${escapeHtml(copy.useBadge)}</p>` : ""}
      </div>
      ${useCasesHtml(useCases)}
    </section>`;
  }

  /* WORKFLOW — rail visual + captions (Landing rail rhythm) */
  if (flowRail.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="workflow" aria-labelledby="bs-dr-flow-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.flowLabel || "FROM DATA TO REPORT")}</p>
      <h2 class="bs-title" id="bs-dr-flow-title">${escapeHtml(copy.flowTitle || "")}</h2>
      ${dataReportingFlowHtml(flowDetail)}
    </div></section>`;
  }

  /* SOURCES — connection diagram */
  if (sourcePreview.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-sources-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.sourcesLabel || "DATA SOURCES")}</p>
      <h2 class="bs-title" id="bs-dr-sources-title">${escapeHtml(copy.sourcesTitle || "")}</h2>
      <div class="bs-dr-connect" aria-hidden="true">
        <div class="bs-dr-connect__col">
          <p class="bs-dr-connect__k">SOURCES</p>
          ${sourcePreview.map((s) => `<span class="bs-dr-connect__chip">${escapeHtml(s)}</span>`).join("")}
        </div>
        <div class="bs-dr-connect__mid">
          <div class="bs-dr-connect__pipe">
            <span>COLLECT</span><i></i><span>CLEAN</span><i></i><span class="is-on">REPORT</span>
          </div>
          <p class="bs-dr-connect__note">ONE FLOW</p>
        </div>
        <div class="bs-dr-connect__col bs-dr-connect__col--out">
          <p class="bs-dr-connect__k">OUTPUTS</p>
          <span class="bs-dr-connect__chip is-out">Dashboard</span>
          <span class="bs-dr-connect__chip is-out">Weekly Report</span>
          <span class="bs-dr-connect__chip is-out">Email Delivery</span>
          <span class="bs-dr-connect__chip is-out">AI Summary</span>
        </div>
      </div>
      ${tagChips(copy.sources)}
      ${copy.sourcesNote ? `<p class="bs-note">${escapeHtml(copy.sourcesNote)}</p>` : ""}
    </div></section>`;
  }

  /* OUTPUT — dual mock: report document + live dashboard */
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-output-title"><div class="bs-inner">
    <p class="bs-eyebrow">OUTPUT</p>
    <h2 class="bs-title" id="bs-dr-output-title">${escapeHtml(copy.reportTitle || copy.dashTitle || "Reports and dashboards")}</h2>
    ${copy.reportLead || copy.dashLead ? `<p class="bs-lead">${escapeHtml(copy.reportLead || copy.dashLead || "")}</p>` : ""}
    <div class="bs-dr-output" aria-hidden="true">
      <div class="bs-dr-output__frame bs-dr-output__frame--report">
        <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">REPORT</span><span>WEEKLY · AUTO</span></div>
        <div class="bs-dr-output__page">
          <p class="bs-dr-output__doc-k">EXECUTIVE SUMMARY</p>
          <p class="bs-dr-output__doc-t">Weekly performance brief</p>
          <div class="bs-dr-output__lines"><i></i><i></i><i style="width:72%"></i></div>
          <div class="bs-dr-output__tags">${reportPreview
            .slice(0, 4)
            .map((t) => `<span>${escapeHtml(t)}</span>`)
            .join("")}</div>
          <div class="bs-dr-output__spark"><i style="height:40%"></i><i style="height:55%"></i><i style="height:48%"></i><i style="height:70%"></i><i style="height:62%"></i><i style="height:80%"></i></div>
        </div>
      </div>
      <div class="bs-dr-output__frame bs-dr-output__frame--dash">
        <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">DASHBOARD</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
        <div class="bs-dr-output__page">
          <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
            .slice(0, 4)
            .map(
              (m, i) =>
                `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
            )
            .join("")}</div>
          <div class="bs-dr-output__chart">
            <div class="bs-dr-output__bars"><i style="height:45%"></i><i style="height:62%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:71%"></i><i style="height:85%"></i><i style="height:92%"></i></div>
            <div class="bs-dr-output__filters">${(copy.dashFilters || [])
              .slice(0, 4)
              .map((f, i) => `<em class="${i === 0 ? "is-on" : ""}">${escapeHtml(f)}</em>`)
              .join("")}</div>
          </div>
        </div>
      </div>
    </div>
    ${copy.dashNote ? `<p class="bs-note">${escapeHtml(copy.dashNote)}</p>` : ""}
  </div></section>`;

  /* AI — quality cards */
  if ((copy.aiExamples || []).length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-ai-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.aiLabel || "AI REPORTING")}</p>
      <h2 class="bs-title" id="bs-dr-ai-title">${escapeHtml(copy.aiTitle || "")}</h2>
      ${copy.aiLead ? `<p class="bs-lead">${escapeHtml(copy.aiLead)}</p>` : ""}
      <div class="bs-quality">${(copy.aiExamples || [])
        .map(
          (title, i) =>
            `<article class="bs-quality__item"><span class="bs-quality__n">${pad2(i + 1)}</span><h3>${escapeHtml(title)}</h3></article>`
        )
        .join("")}</div>
      ${copy.aiNote ? `<p class="bs-note">${escapeHtml(copy.aiNote)}</p>` : ""}
    </div></section>`;
  }

  /* SCOPE */
  if (copy.scopes?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-scope-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.scopeLabel || "SCOPE LEVELS")}</p>
      <h2 class="bs-title" id="bs-dr-scope-title">${escapeHtml(copy.scopeTitle || "")}</h2>
      ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
      <div class="bs-scope bs-scope--levels bs-scope--cards">${copy.scopes
        .map(
          (s, i) =>
            `<article class="bs-scope__col"><p class="bs-scope__k"><span class="bs-scope__lvl">${pad2(i + 1)}</span>${escapeHtml(s.t)}</p><ul class="bs-scope__list">${(s.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  html += engagementSectionHtml(copy, timelines, { priceNameDefault: "DATA & REPORTING" });

  if ((copy.processItems || copy.process)?.length) {
    const processDetail = (copy.processItems || copy.process).map((p) => ({
      n: p.n,
      title: p.title || p.t,
      body: p.body || p.d,
    }));
    html += `<section class="bs-section" data-bs-reveal id="process" aria-labelledby="bs-dr-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">PROCESS</p>
      <h2 class="bs-title" id="bs-dr-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${dataReportingProcessHtml(processDetail)}
    </div></section>`;
  }

  if (copy.deliverItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">DELIVERABLES</p>
      <h2 class="bs-title" id="bs-dr-deliver-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${copy.deliverLead ? `<p class="bs-lead">${escapeHtml(copy.deliverLead)}</p>` : ""}
      ${deliverGridHtml(copy.deliverItems, copy.deliverExtras)}
    </div></section>`;
  }

  return html;
}

function researchDetailExtras(copy, cfg = {}) {
  const flowHtmlFn = cfg.flowHtml || marketResearchFlowHtml;
  const processHtmlFn = cfg.processHtml || marketResearchProcessHtml;
  const connectPipe = cfg.connectPipe || ["DEFINE", "ANALYZE", "INSIGHT"];
  const connectActive = cfg.connectActive ?? 2;
  const connectNote = cfg.connectNote || "ONE BRIEF";
  const connectOutputs = cfg.connectOutputs || [
    "Research Brief",
    "Market Map",
    "Competitive Summary",
    "Implications",
  ];
  const outputSecondLabel = cfg.outputSecondLabel || "MARKET MAP";
  const outputSecondKind = cfg.outputSecondKind || "dash";
  const metricVals = cfg.metricVals || ["6", "12", "4", "3"];
  const connectPipeHtml = connectPipe
    .map((label, i) => {
      const cls = i === connectActive ? ' class="is-on"' : "";
      const sep = i < connectPipe.length - 1 ? "<i></i>" : "";
      return `<span${cls}>${escapeHtml(label)}</span>${sep}`;
    })
    .join("");
  const overview = copy.overviewBody || [];
  const problems = (copy.problems || []).map((p) => ({
    n: p.n,
    title: p.t,
    body: p.d,
  }));
  const caps = (copy.caps || []).map((cap, i) => ({
    n: pad2(i + 1),
    title: cap.t,
    body: cap.d,
  }));
  const useCases = (copy.useCases || []).map((u, i) => ({
    n: pad2(i + 1),
    title: u.t,
    body: u.d,
    tag: u.tag || "",
  }));
  const flowRail = (copy.flow || []).map((f) => ({ n: f.n, title: f.t }));
  const flowDetail = (copy.flow || []).map((f) => ({
    n: f.n,
    title: f.t,
    body: f.d,
    examples: f.examples,
  }));
  const timelines = (copy.timelines || []).map((t, i) => ({
    title: t.t,
    body: t.d,
    n: pad2(i + 1),
  }));
  const sourcePreview = (copy.sources || []).slice(0, 6);
  const reportPreview = (copy.reportItems || []).slice(0, 6);
  const before = copy.before || [];
  const after = copy.after || [];
  const outputSecondHtml =
    outputSecondKind === "matrix"
      ? researchOutputMatrixFrame(copy, metricVals, outputSecondLabel)
      : outputSecondKind === "segments"
        ? researchOutputSegmentsFrame(copy, metricVals, outputSecondLabel)
        : outputSecondKind === "audit"
          ? researchOutputAuditFrame(copy, metricVals, outputSecondLabel)
          : outputSecondKind === "trends"
            ? researchOutputTrendsFrame(copy, metricVals, outputSecondLabel)
            : outputSecondKind === "blueprint"
              ? researchOutputBlueprintFrame(copy, metricVals, outputSecondLabel)
              : outputSecondKind === "launch"
                ? researchOutputLaunchFrame(copy, metricVals, outputSecondLabel)
                : outputSecondKind === "console"
                  ? researchOutputConsoleFrame(copy, metricVals, outputSecondLabel)
                  : outputSecondKind === "scope"
                    ? researchOutputScopeFrame(copy, metricVals, outputSecondLabel)
                    : outputSecondKind === "responsive"
                      ? researchOutputResponsiveFrame(copy, metricVals, outputSecondLabel)
                      : outputSecondKind === "landing-page"
                        ? researchOutputLandingFrame(copy, metricVals, outputSecondLabel)
                        : outputSecondKind === "screens"
                          ? researchOutputScreensFrame(copy, metricVals, outputSecondLabel)
                          : outputSecondKind === "ailoop"
                            ? researchOutputAiLoopFrame(copy, metricVals, outputSecondLabel)
                            : outputSecondKind === "brand"
                              ? researchOutputBrandFrame(copy, metricVals, outputSecondLabel)
                              : `<div class="bs-dr-output__frame bs-dr-output__frame--dash">
        <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">${escapeHtml(outputSecondLabel)}</span><span class="bs-dr-output__live"><i></i> LIVE</span></div>
        <div class="bs-dr-output__page">
          <div class="bs-dr-output__kpis">${(copy.dashMetrics || [])
            .slice(0, 4)
            .map(
              (m, i) =>
                `<div><span>${escapeHtml(String(m).toUpperCase())}</span><strong>${escapeHtml(metricVals[i] || "—")}</strong></div>`
            )
            .join("")}</div>
          <div class="bs-dr-output__chart">
            <div class="bs-dr-output__bars"><i style="height:45%"></i><i style="height:62%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:71%"></i><i style="height:85%"></i><i style="height:92%"></i></div>
            <div class="bs-dr-output__filters">${(copy.dashFilters || [])
              .slice(0, 4)
              .map((f, i) => `<em class="${i === 0 ? "is-on" : ""}">${escapeHtml(f)}</em>`)
              .join("")}</div>
          </div>
        </div>
      </div>`;

  let html = "";

  /* OVERVIEW — editorial statement + meta strip */
  if (overview.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(copy.overviewLabel || "OVERVIEW")}</p>
          <h2 class="bs-title" id="bs-dr-overview-title">${brHeadline(copy.overviewTitle || "")}</h2>
          <div class="bs-overview">${overview.map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p)}</p>`).join("")}</div>
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${(copy.meta || [])
          .map(
            (m) =>
              `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
          )
          .join("")}</aside>
      </div>
    </div></section>`;
  }

  if (problems.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-part="problems" data-bs-reveal aria-labelledby="bs-dr-problems-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.problemsLabel || "PROBLEMS")}</p>
      <h2 class="bs-title" id="bs-dr-problems-title">${escapeHtml(copy.problemsTitle || "")}</h2>
      ${areasHtml(problems, "signal")}
    </div></section>`;
  }

  if (before.length || after.length) {
    html += `<section class="bs-section" data-bs-part="compare" data-bs-reveal aria-labelledby="bs-dr-compare-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.baLabel || "BEFORE / AFTER")}</p>
      <h2 class="bs-title" id="bs-dr-compare-title">${brHeadline(copy.baTitle || "BEFORE vs AFTER")}</h2>
      <div class="bs-compare">
        <div class="bs-compare__col">
          <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeLabel || "BEFORE")}</h3></div>
          <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
        <div class="bs-compare__col is-after">
          <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterLabel || "AFTER")}</h3></div>
          <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
      </div>
    </div></section>`;
  }

  if (caps.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-part="capabilities" data-bs-reveal aria-labelledby="bs-dr-caps-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.capsLabel || "CAPABILITIES")}</p>
      <h2 class="bs-title" id="bs-dr-caps-title">${escapeHtml(copy.capsTitle || "")}</h2>
      ${areasHtml(caps, "caps")}
    </div></section>`;
  }

  /* USE CASES — area cards like AI page */
  if (useCases.length) {
    html += `<section class="bs-section bs-usecases" data-bs-part="usecases" data-bs-reveal aria-labelledby="bs-dr-areas-title">
      <div class="bs-usecases__head bs-inner">
        <p class="bs-eyebrow">${escapeHtml(copy.useLabel || "USE CASES")}</p>
        <h2 class="bs-title" id="bs-dr-areas-title">${escapeHtml(copy.useTitle || "")}</h2>
        ${copy.useBadge ? `<p class="bs-mono bs-dr-badge">${escapeHtml(copy.useBadge)}</p>` : ""}
      </div>
      ${useCasesHtml(useCases)}
    </section>`;
  }

  /* WORKFLOW — rail visual + captions (Landing rail rhythm) */
  if (flowRail.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="workflow" aria-labelledby="bs-dr-flow-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.flowLabel || "RESEARCH FLOW")}</p>
      <h2 class="bs-title" id="bs-dr-flow-title">${escapeHtml(copy.flowTitle || "")}</h2>
      ${flowHtmlFn(flowDetail)}
    </div></section>`;
  }

  /* SOURCES — connection diagram */
  if (sourcePreview.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-sources-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.sourcesLabel || "DATA SOURCES")}</p>
      <h2 class="bs-title" id="bs-dr-sources-title">${escapeHtml(copy.sourcesTitle || "")}</h2>
      <div class="bs-dr-connect" aria-hidden="true">
        <div class="bs-dr-connect__col">
          <p class="bs-dr-connect__k">INPUTS</p>
          ${sourcePreview.map((s) => `<span class="bs-dr-connect__chip">${escapeHtml(s)}</span>`).join("")}
        </div>
        <div class="bs-dr-connect__mid">
          <div class="bs-dr-connect__pipe">
            ${connectPipeHtml}
          </div>
          <p class="bs-dr-connect__note">${escapeHtml(connectNote)}</p>
        </div>
        <div class="bs-dr-connect__col bs-dr-connect__col--out">
          <p class="bs-dr-connect__k">OUTPUTS</p>
          ${connectOutputs.map((o) => `<span class="bs-dr-connect__chip is-out">${escapeHtml(o)}</span>`).join("")}
        </div>
      </div>
      ${tagChips(copy.sources)}
      ${copy.sourcesNote ? `<p class="bs-note">${escapeHtml(copy.sourcesNote)}</p>` : ""}
    </div></section>`;
  }

  /* OUTPUT — dual mock: report document + live dashboard */
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-output-title"><div class="bs-inner">
    <p class="bs-eyebrow">OUTPUT</p>
    <h2 class="bs-title" id="bs-dr-output-title">${escapeHtml(copy.reportTitle || copy.dashTitle || "Reports and dashboards")}</h2>
    ${copy.reportLead || copy.dashLead ? `<p class="bs-lead">${escapeHtml(copy.reportLead || copy.dashLead || "")}</p>` : ""}
    <div class="bs-dr-output" aria-hidden="true">
      <div class="bs-dr-output__frame bs-dr-output__frame--report">
        <div class="bs-dr-output__chrome"><span class="bs-dr-output__label">BRIEF</span><span>${escapeHtml(copy.reportMockStatus || "MARKET · DRAFT")}</span></div>
        <div class="bs-dr-output__page">
          <p class="bs-dr-output__doc-k">${escapeHtml(copy.reportMockK || "MARKET SUMMARY")}</p>
          <p class="bs-dr-output__doc-t">${escapeHtml(copy.reportMockT || "Category landscape brief")}</p>
          <div class="bs-dr-output__lines"><i></i><i></i><i style="width:72%"></i></div>
          <div class="bs-dr-output__tags">${reportPreview
            .slice(0, 4)
            .map((t) => `<span>${escapeHtml(t)}</span>`)
            .join("")}</div>
          <div class="bs-dr-output__spark"><i style="height:40%"></i><i style="height:55%"></i><i style="height:48%"></i><i style="height:70%"></i><i style="height:62%"></i><i style="height:80%"></i></div>
        </div>
      </div>
      ${outputSecondHtml}
    </div>
    ${copy.dashNote ? `<p class="bs-note">${escapeHtml(copy.dashNote)}</p>` : ""}
  </div></section>`;

  /* AI — quality cards */
  if ((copy.aiExamples || []).length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-ai-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.aiLabel || "AI REPORTING")}</p>
      <h2 class="bs-title" id="bs-dr-ai-title">${escapeHtml(copy.aiTitle || "")}</h2>
      ${copy.aiLead ? `<p class="bs-lead">${escapeHtml(copy.aiLead)}</p>` : ""}
      <div class="bs-quality">${(copy.aiExamples || [])
        .map(
          (title, i) =>
            `<article class="bs-quality__item"><span class="bs-quality__n">${pad2(i + 1)}</span><h3>${escapeHtml(title)}</h3></article>`
        )
        .join("")}</div>
      ${copy.aiNote ? `<p class="bs-note">${escapeHtml(copy.aiNote)}</p>` : ""}
    </div></section>`;
  }

  /* SCOPE */
  if (copy.scopes?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-dr-scope-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.scopeLabel || "SCOPE LEVELS")}</p>
      <h2 class="bs-title" id="bs-dr-scope-title">${escapeHtml(copy.scopeTitle || "")}</h2>
      ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
      <div class="bs-scope bs-scope--levels bs-scope--cards">${copy.scopes
        .map(
          (s, i) =>
            `<article class="bs-scope__col"><p class="bs-scope__k"><span class="bs-scope__lvl">${pad2(i + 1)}</span>${escapeHtml(s.t)}</p><ul class="bs-scope__list">${(s.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  html += engagementSectionHtml(copy, timelines, { priceNameDefault: "MARKET RESEARCH" });

  if ((copy.processItems || copy.process)?.length) {
    const processDetail = (copy.processItems || copy.process).map((p) => ({
      n: p.n,
      title: p.title || p.t,
      body: p.body || p.d,
      examples: p.examples,
    }));
    html += `<section class="bs-section" data-bs-reveal id="process" aria-labelledby="bs-dr-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">PROCESS</p>
      <h2 class="bs-title" id="bs-dr-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${processHtmlFn(processDetail)}
    </div></section>`;
  }

  if (copy.deliverItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-dr-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">DELIVERABLES</p>
      <h2 class="bs-title" id="bs-dr-deliver-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${copy.deliverLead ? `<p class="bs-lead">${escapeHtml(copy.deliverLead)}</p>` : ""}
      ${deliverGridHtml(copy.deliverItems, copy.deliverExtras)}
    </div></section>`;
  }

  return html;
}

function researchStreamlinedHelpers(copy, processHtmlFn) {
  const timelines = (copy.timelines || []).map((t, i) => ({
    title: t.t,
    body: t.d,
    n: pad2(i + 1),
  }));
  return {
    areasHtml,
    processHtmlFn: processHtmlFn || marketResearchProcessHtml,
    engagementSectionHtml,
    tagChips,
    timelines,
  };
}

function marketResearchExtras(copy) {
  return streamlinedResearchDetail(
    copy,
    "market-research",
    researchStreamlinedHelpers(copy, marketResearchProcessHtml)
  );
}

function competitorAnalysisExtras(copy) {
  return streamlinedResearchDetail(
    copy,
    "competitor-analysis",
    researchStreamlinedHelpers(copy, competitorAnalysisProcessHtml)
  );
}

function consumerResearchExtras(copy) {
  return streamlinedResearchDetail(
    copy,
    "consumer-research",
    researchStreamlinedHelpers(copy, consumerResearchProcessHtml)
  );
}

function uxAuditExtras(copy) {
  return streamlinedResearchDetail(copy, "ux-audit", researchStreamlinedHelpers(copy, uxAuditProcessHtml));
}

function trendResearchExtras(copy) {
  return streamlinedResearchDetail(
    copy,
    "trend-research",
    researchStreamlinedHelpers(copy, trendResearchProcessHtml)
  );
}

function customProductExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: customProductFlowHtml,
    processHtml: customProductProcessHtml,
    connectPipe: ["DEFINE", "DESIGN", "BUILD"],
    connectActive: 2,
    connectNote: "ONE PRODUCT",
    connectOutputs: ["Product Spec", "UX / UI", "Build", "Handoff"],
    outputSecondLabel: "MODULE MAP",
    outputSecondKind: "blueprint",
    metricVals: ["8", "3", "2", "5"],
  });
}

function productLaunchExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: productLaunchFlowHtml,
    processHtml: productLaunchProcessHtml,
    connectPipe: ["IDEA", "BUILD", "LAUNCH"],
    connectActive: 2,
    connectNote: "ONE LAUNCH",
    connectOutputs: ["Launch Plan", "Product", "Landing", "Checklist"],
    outputSecondLabel: "LAUNCH CHECKLIST",
    outputSecondKind: "launch",
    metricVals: ["6", "8", "4", "1"],
  });
}

function internalSystemExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: internalSystemFlowHtml,
    processHtml: internalSystemProcessHtml,
    connectPipe: ["MAP", "BUILD", "OPERATE"],
    connectActive: 2,
    connectNote: "ONE SYSTEM",
    connectOutputs: ["System Spec", "Admin Console", "Permissions", "Ops Guide"],
    outputSecondLabel: "OPS CONSOLE",
    outputSecondKind: "console",
    metricVals: ["6", "5", "12", "4"],
  });
}

function mvpDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["IDEA", "BUILD", "LAUNCH"],
    connectActive: 2,
    connectNote: "ONE MVP",
    connectOutputs: ["Scope Doc", "UX Flow", "Working MVP", "Roadmap"],
    outputSecondLabel: "MVP SCOPE",
    outputSecondKind: "scope",
    metricVals: ["8", "12", "3", "2"],
  });
}

function webDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["STRATEGY", "DESIGN", "LAUNCH"],
    connectActive: 2,
    connectNote: "ONE SITE",
    connectOutputs: ["Site Map", "UI Design", "Responsive Web", "Deploy"],
    outputSecondLabel: "RESPONSIVE",
    outputSecondKind: "responsive",
    metricVals: ["5", "8", "2", "3"],
  });
}

function landingDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["MESSAGE", "DESIGN", "CONVERT"],
    connectActive: 2,
    connectNote: "ONE PAGE",
    connectOutputs: ["Page Structure", "UI Design", "Landing Build", "Analytics"],
    outputSecondLabel: "LANDING FLOW",
    outputSecondKind: "landing-page",
    metricVals: ["6", "3", "2", "2"],
  });
}

function appDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["DEFINE", "PROTOTYPE", "HANDOFF"],
    connectActive: 2,
    connectNote: "ONE FLOW",
    connectOutputs: ["Flow Spec", "Screens", "Prototype", "Handoff"],
    outputSecondLabel: "APP SCREENS",
    outputSecondKind: "screens",
    metricVals: ["12", "3", "2", "4"],
  });
}

function aiAutomationDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["MAP", "AUTOMATE", "OPERATE"],
    connectActive: 2,
    connectNote: "ONE WORKFLOW",
    connectOutputs: ["Workflow Map", "AI Modules", "Integrations", "Ops Guide"],
    outputSecondLabel: "AI LOOP",
    outputSecondKind: "ailoop",
    metricVals: ["4", "2", "5", "8"],
  });
}

function whiteLabelDetailExtras(copy) {
  return researchDetailExtras(copy, {
    flowHtml: buildServiceFlowHtml,
    processHtml: buildServiceProcessHtml,
    connectPipe: ["BASE", "BRAND", "LAUNCH"],
    connectActive: 2,
    connectNote: "ONE PRODUCT",
    connectOutputs: ["Base System", "Brand Layer", "Config", "Launch"],
    outputSecondLabel: "BRAND CONFIG",
    outputSecondKind: "brand",
    metricVals: ["6", "1", "8", "2"],
  });
}

function workflowAutomationExtras(copy) {
  const overview = copy.overviewBody || [];
  const problems = (copy.problems || copy.solveItems || []).map((p) => ({
    n: p.n,
    title: p.t || p.title,
    body: p.d || p.body,
  }));
  const caps = (copy.caps || []).map((cap, i) => ({
    n: pad2(i + 1),
    title: cap.t || cap.title,
    body: cap.d || cap.body,
  }));
  if (!caps.length && copy.getItems?.length) {
    caps.push(
      ...copy.getItems.map((it) => ({
        n: it.n,
        title: it.title,
        body: it.body,
      }))
    );
  }
  const structureRail = (copy.structure || []).map((s) => ({ n: s.n, title: s.t }));
  const structureDetail = (copy.structure || []).map((s) => ({
    n: s.n,
    title: s.t,
    body: s.d,
    examples: s.examples,
  }));
  const integPreview = (copy.integGroups || []).flatMap((g) => (g.items || []).slice(0, 2)).slice(0, 6);
  const timelines = (copy.timelines || []).map((t, i) => ({
    title: t.t,
    body: t.d,
    n: pad2(i + 1),
  }));
  const processDetail = (copy.processItems || copy.process || []).map((p) => ({
    n: p.n,
    title: p.t || p.title,
    body: p.d || p.body,
  }));
  const before = copy.before || [];
  const after = copy.after || [];

  let html = "";

  if (overview.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(copy.overviewLabel || "OVERVIEW")}</p>
          <h2 class="bs-title" id="bs-wfa-overview-title">${brHeadline(copy.overviewTitle || "")}</h2>
          <div class="bs-overview">${overview.map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p)}</p>`).join("")}</div>
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${(copy.meta || [])
          .map(
            (m) =>
              `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
          )
          .join("")}</aside>
      </div>
    </div></section>`;
  }

  if (problems.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-wfa-why-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.whyLabel || copy.solveEyebrow || "WHY AUTOMATION")}</p>
      <h2 class="bs-title" id="bs-wfa-why-title">${brHeadline(copy.whyTitle || copy.solveTitle || "")}</h2>
      ${copy.whyLead || copy.solveLead ? `<p class="bs-lead">${escapeHtml(copy.whyLead || copy.solveLead)}</p>` : ""}
      ${areasHtml(problems, "signal")}
    </div></section>`;
  }

  if (before.length || after.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-compare-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.baLabel || "BEFORE / AFTER")}</p>
      <h2 class="bs-title" id="bs-wfa-compare-title">${brHeadline(copy.baTitle || "BEFORE vs AFTER")}</h2>
      <div class="bs-compare">
        <div class="bs-compare__col">
          <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeLabel || "BEFORE")}</h3></div>
          <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
        <div class="bs-compare__col is-after">
          <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterLabel || "AFTER")}</h3></div>
          <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
      </div>
    </div></section>`;
  }

  if (structureRail.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="workflow" aria-labelledby="bs-wfa-structure-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.structureLabel || "HOW IT WORKS")}</p>
      <h2 class="bs-title" id="bs-wfa-structure-title">${brHeadline(copy.structureTitle || "")}</h2>
      ${workflowStructureHtml(structureDetail)}
    </div></section>`;
  }

  if (caps.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-caps-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.getEyebrow || "CAPABILITIES")}</p>
      <h2 class="bs-title" id="bs-wfa-caps-title">${escapeHtml(copy.getTitle || copy.capsTitle || "")}</h2>
      ${workflowCapsHtml(caps)}
    </div></section>`;
  }

  if (copy.useCases?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-wfa-cases-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.useLabel || "POSSIBILITIES")}</p>
      <h2 class="bs-title" id="bs-wfa-cases-title">${brHeadline(copy.useTitle || "")}</h2>
      ${copy.useBadge ? `<p class="bs-mono bs-dr-badge">${escapeHtml(copy.useBadge)}</p>` : ""}
      ${workflowCasesHtml(copy.useCases)}
    </div></section>`;
  }

  if (copy.integGroups?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-integ-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.integLabel || "INTEGRATIONS")}</p>
      <h2 class="bs-title" id="bs-wfa-integ-title">${brHeadline(copy.integTitle || "")}</h2>
      <div class="bs-dr-connect" aria-hidden="true">
        <div class="bs-dr-connect__col">
          <p class="bs-dr-connect__k">YOUR TOOLS</p>
          ${integPreview.map((s) => `<span class="bs-dr-connect__chip">${escapeHtml(s)}</span>`).join("")}
        </div>
        <div class="bs-dr-connect__mid">
          <div class="bs-dr-connect__pipe">
            <span>TRIGGER</span><i></i><span>PROCESS</span><i></i><span class="is-on">ACTION</span>
          </div>
          <p class="bs-dr-connect__note">ONE WORKFLOW</p>
        </div>
        <div class="bs-dr-connect__col bs-dr-connect__col--out">
          <p class="bs-dr-connect__k">OUTPUTS</p>
          <span class="bs-dr-connect__chip is-out">Email</span>
          <span class="bs-dr-connect__chip is-out">Slack</span>
          <span class="bs-dr-connect__chip is-out">CRM</span>
          <span class="bs-dr-connect__chip is-out">Task</span>
        </div>
      </div>
      <div class="bs-integ-grid">${copy.integGroups
        .map(
          (g) =>
            `<article class="bs-integ-grid__col"><p class="bs-integ-grid__k">${escapeHtml(g.k)}</p><ul>${(g.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></article>`
        )
        .join("")}</div>
      ${copy.integNote ? `<p class="bs-note">${escapeHtml(copy.integNote)}</p>` : ""}
    </div></section>`;
  }

  if ((copy.aiExamples || []).length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-wfa-ai-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.aiLabel || "AI EXTENSION")}</p>
      <h2 class="bs-title" id="bs-wfa-ai-title">${brHeadline(copy.aiTitle || "")}</h2>
      ${copy.aiLead ? `<p class="bs-lead">${escapeHtml(copy.aiLead)}</p>` : ""}
      ${workflowAiSectionHtml(copy)}
      ${copy.aiNote ? `<p class="bs-note">${escapeHtml(copy.aiNote)}</p>` : ""}
    </div></section>`;
  }

  const loopSteps = copy.loopSteps || [];
  const humanItems = copy.humanExamples || [];
  if (loopSteps.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-control-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.controlLabel || "CONTROL")}</p>
      <h2 class="bs-title" id="bs-wfa-control-title">${brHeadline(copy.controlTitle || "")}</h2>
      ${copy.controlLead ? `<p class="bs-lead">${escapeHtml(copy.controlLead)}</p>` : ""}
      <div class="bs-wf-control-split">
        <div class="bs-wf-approval" aria-hidden="true">
          <div class="bs-wf-approval__frame">
            <div class="bs-wf-approval__head"><span>PENDING REVIEW</span><span class="bs-wf-approval__live"><i></i> LIVE</span></div>
            <div class="bs-wf-approval__body">
              <p class="bs-wf-approval__k">QUOTE READY</p>
              <div class="bs-wf-approval__steps">${loopSteps
                .map(
                  (s, i) =>
                    `<span class="${i === 2 ? "is-on" : i < 2 ? "is-done" : ""}">${escapeHtml(s.title)}</span>`
                )
                .join("")}</div>
              <div class="bs-wf-approval__actions"><em>Reject</em><strong>Approve</strong></div>
            </div>
          </div>
        </div>
        <div class="bs-human">
          <p class="bs-human__k">${escapeHtml(copy.humanLabel || "EXAMPLES")}</p>
          <ul class="bs-human__list">${humanItems.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
        </div>
      </div>
      ${railHtml(loopSteps.map((s) => ({ n: s.n, title: s.title })))}
    </div></section>`;
  }

  if (copy.reliabilityItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-wfa-reliability-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.reliabilityLabel || "RELIABILITY")}</p>
      <h2 class="bs-title" id="bs-wfa-reliability-title">${brHeadline(copy.reliabilityTitle || "")}</h2>
      ${copy.reliabilityLead ? `<p class="bs-lead">${escapeHtml(copy.reliabilityLead)}</p>` : ""}
      ${tagChips(copy.reliabilityItems)}
      <div class="bs-wfa-error-flow" aria-hidden="true">
        <div class="bs-wfa-error-flow__frame">
          <div class="bs-wfa-error-flow__head"><span>ERROR PATH</span><span class="bs-wfa-error-flow__live"><i></i> SIM</span></div>
          <div class="bs-wfa-error-flow__track">
            <span class="is-fail">API timeout</span><i></i><span class="is-on">Retry</span><i></i><span>Log error</span><i></i><span class="is-out">Notify owner</span>
          </div>
        </div>
      </div>
      <div class="bs-wf-scenarios">${(copy.reliabilityScenarios || [])
        .map(
          (s) =>
            `<article class="bs-wf-scenarios__item"><h3>${escapeHtml(s.t)}</h3><p>${escapeHtml(s.d)}</p></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  if (copy.monitorMetrics?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-monitor-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.monitorLabel || "MONITORING")}</p>
      <h2 class="bs-title" id="bs-wfa-monitor-title">${brHeadline(copy.monitorTitle || "")}</h2>
      ${copy.monitorLead ? `<p class="bs-lead">${escapeHtml(copy.monitorLead)}</p>` : ""}
      <div class="bs-wfa-monitor-stack">
        <div class="bs-status">
          <div class="bs-status__top">
            <p class="bs-demo__badge">WORKFLOW MONITOR</p>
            <span class="bs-status__live"><i></i> ACTIVE</span>
          </div>
          <div class="bs-status__grid bs-status__grid--quad">${copy.monitorMetrics
            .slice(0, 8)
            .map(
              (m, i) =>
                `<div class="bs-status__cell"><p class="bs-demo__k">${escapeHtml(String(m).toUpperCase())}</p><p class="bs-demo__v">${escapeHtml(["128", "96%", "4", "2", "1.2s", "0", "OK", "Idle"][i] || "—")}</p></div>`
            )
            .join("")}</div>
        </div>
        <div class="bs-wfa__queue bs-wfa__queue--monitor">
          <div class="bs-wfa__qitem is-done"><span>Inquiry workflow</span><em>Done</em></div>
          <div class="bs-wfa__qitem is-run"><span>Order sync</span><em>Running</em></div>
          <div class="bs-wfa__qitem"><span>Weekly report</span><em>Queued</em></div>
        </div>
      </div>
      ${copy.monitorNote ? `<p class="bs-note">${escapeHtml(copy.monitorNote)}</p>` : ""}
    </div></section>`;
  }

  if (copy.scopes?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="scope" aria-labelledby="bs-wfa-scope-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.scopeLabel || "SCOPE")}</p>
      <h2 class="bs-title" id="bs-wfa-scope-title">${escapeHtml(copy.scopeTitle || "")}</h2>
      <div class="bs-scope bs-scope--levels bs-scope--cards">${copy.scopes
        .map(
          (s, i) =>
            `<article class="bs-scope__col"><p class="bs-scope__k"><span class="bs-scope__lvl">${pad2(i + 1)}</span>${escapeHtml(s.t)}</p><ul class="bs-scope__list">${(s.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  html += engagementSectionHtml(copy, timelines, {
    id: "bs-wfa-engage-title",
    sectionClass: "bs-section bs-section--surface",
    priceNameDefault: "WORKFLOW AUTOMATION",
    lead: copy.timeLead || copy.priceLead || "",
  });

  if (processDetail.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="process" aria-labelledby="bs-wfa-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">PROCESS</p>
      <h2 class="bs-title" id="bs-wfa-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${workflowProcessHtml(processDetail)}
    </div></section>`;
  }

  if (copy.deliverItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-wfa-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">DELIVERABLES</p>
      <h2 class="bs-title" id="bs-wfa-deliver-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${copy.deliverLead ? `<p class="bs-lead">${escapeHtml(copy.deliverLead)}</p>` : ""}
      ${deliverGridHtml(copy.deliverItems, copy.deliverExtras)}
    </div></section>`;
  }

  return html;
}

function internalToolsExtras(copy) {
  const overview = copy.overviewBody || [];
  const problems = (copy.problems || []).map((p) => ({
    n: p.n,
    title: p.t,
    body: p.d,
  }));
  const useCases = (copy.useCases || []).map((u, i) => ({
    n: pad2(i + 1),
    title: u.t,
    body: u.d,
    tag: u.tag || "",
  }));
  const flowRail = (copy.flow || []).map((f) => ({ n: f.n, title: f.t }));
  const flowDetail = (copy.flow || []).map((f) => ({ n: f.n, title: f.t, body: f.d }));
  const processDetail = (copy.processItems || copy.process || []).map((p) => ({
    n: p.n,
    title: p.t || p.title,
    body: p.d || p.body,
  }));
  const timelines = (copy.timelines || []).map((t, i) => ({
    title: t.t,
    body: t.d,
    n: pad2(i + 1),
  }));
  const before = copy.before || [];
  const after = copy.after || [];
  const integPreview = (copy.integrations || []).slice(0, 6);

  let html = "";

  if (overview.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-it-overview-title"><div class="bs-inner">
      <div class="bs-dr-split">
        <div class="bs-dr-split__copy">
          <p class="bs-eyebrow">${escapeHtml(copy.overviewLabel || "OVERVIEW")}</p>
          <h2 class="bs-title" id="bs-it-overview-title">${brHeadline(copy.overviewTitle || "")}</h2>
          <div class="bs-overview">${overview.map((p, i) => `<p class="${i === 0 ? "bs-lead" : ""}">${escapeHtml(p)}</p>`).join("")}</div>
        </div>
        <aside class="bs-dr-meta" aria-label="Service summary">${(copy.meta || [])
          .map(
            (m) =>
              `<div class="bs-dr-meta__row"><p class="bs-dr-meta__k">${escapeHtml(m.k)}</p><p class="bs-dr-meta__v">${escapeHtml(m.v)}</p></div>`
          )
          .join("")}</aside>
      </div>
    </div></section>`;
  }

  if (problems.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-it-problems-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.problemsLabel || "PROBLEMS")}</p>
      <h2 class="bs-title" id="bs-it-problems-title">${escapeHtml(copy.problemsTitle || "")}</h2>
      ${areasHtml(problems, "signal")}
    </div></section>`;
  }

  if (before.length || after.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-it-compare-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.baLabel || "COMPARE")}</p>
      <h2 class="bs-title" id="bs-it-compare-title">${escapeHtml(copy.baTitle || "BEFORE vs AFTER")}</h2>
      <div class="bs-compare">
        <div class="bs-compare__col">
          <div class="bs-compare__head"><span class="bs-compare__tag">01</span><h3>${escapeHtml(copy.beforeLabel || "BEFORE")}</h3></div>
          <ol>${before.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
        <div class="bs-compare__col is-after">
          <div class="bs-compare__head"><span class="bs-compare__tag">02</span><h3>${escapeHtml(copy.afterLabel || "AFTER")}</h3></div>
          <ol>${after.map((s, i) => `<li><span>${pad2(i + 1)}</span><p>${escapeHtml(s)}</p></li>`).join("")}</ol>
        </div>
      </div>
    </div></section>`;
  }

  if (useCases.length) {
    html += `<section class="bs-section bs-usecases" data-bs-reveal aria-labelledby="bs-it-areas-title">
      <div class="bs-usecases__head bs-inner">
        <p class="bs-eyebrow">${escapeHtml(copy.useLabel || "POSSIBILITIES")}</p>
        <h2 class="bs-title" id="bs-it-areas-title">${escapeHtml(copy.useTitle || "")}</h2>
        ${copy.useBadge ? `<p class="bs-mono bs-dr-badge">${escapeHtml(copy.useBadge)}</p>` : ""}
      </div>
      ${useCasesHtml(useCases)}
    </section>`;
  }

  if (flowRail.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal id="workflow" aria-labelledby="bs-it-flow-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.flowLabel || "FROM INTAKE TO REVIEW")}</p>
      <h2 class="bs-title" id="bs-it-flow-title">${escapeHtml(copy.flowTitle || "")}</h2>
      ${internalToolsFlowHtml(flowDetail)}
    </div></section>`;
  }

  /* Product preview — console mock */
  html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-it-preview-title"><div class="bs-inner">
    <p class="bs-eyebrow">PREVIEW</p>
    <h2 class="bs-title" id="bs-it-preview-title">${escapeHtml(copy.featuresTitle || "Screens your team can use")}</h2>
    ${copy.featuresLead ? `<p class="bs-lead">${escapeHtml(copy.featuresLead)}</p>` : ""}
    <div class="bs-it-preview" aria-hidden="true">
      <div class="bs-it-preview__frame">
        <div class="bs-it-preview__chrome"><span>INTAKE</span><span>FORM</span></div>
        <div class="bs-it-preview__page">
          <p class="bs-it-preview__k">NEW REQUEST</p>
          <div class="bs-it-preview__fields"><i></i><i></i><i style="width:70%"></i></div>
          <span class="bs-it-preview__cta">Submit →</span>
        </div>
      </div>
      <div class="bs-it-preview__frame is-lead">
        <div class="bs-it-preview__chrome"><span>WORKBOARD</span><span class="bs-it-preview__live"><i></i> LIVE</span></div>
        <div class="bs-it-preview__page">
          <div class="bs-it-preview__cols">
            <div><em>TODO</em><i></i><i></i></div>
            <div class="is-on"><em>DOING</em><i></i><i></i><i></i></div>
            <div><em>DONE</em><i></i></div>
          </div>
        </div>
      </div>
      <div class="bs-it-preview__frame">
        <div class="bs-it-preview__chrome"><span>APPROVAL</span><span>FLOW</span></div>
        <div class="bs-it-preview__page">
          <p class="bs-it-preview__k">PENDING REVIEW</p>
          <div class="bs-it-preview__steps"><span class="is-done">Request</span><span class="is-on">Manager</span><span>Admin</span></div>
          <div class="bs-it-preview__actions"><em>Reject</em><strong>Approve</strong></div>
        </div>
      </div>
    </div>
    ${copy.features?.length ? tagChips(copy.features) : ""}
  </div></section>`;

  if (integPreview.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-it-integ-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.integLabel || "INTEGRATIONS")}</p>
      <h2 class="bs-title" id="bs-it-integ-title">${escapeHtml(copy.integTitle || "")}</h2>
      <div class="bs-dr-connect" aria-hidden="true">
        <div class="bs-dr-connect__col">
          <p class="bs-dr-connect__k">YOUR STACK</p>
          ${integPreview.map((s) => `<span class="bs-dr-connect__chip">${escapeHtml(s)}</span>`).join("")}
        </div>
        <div class="bs-dr-connect__mid">
          <div class="bs-dr-connect__pipe">
            <span>SYNC</span><i></i><span class="is-on">INTERNAL TOOL</span><i></i><span>ACTION</span>
          </div>
          <p class="bs-dr-connect__note">CONNECTED</p>
        </div>
        <div class="bs-dr-connect__col bs-dr-connect__col--out">
          <p class="bs-dr-connect__k">TEAM WORK</p>
          <span class="bs-dr-connect__chip is-out">Requests</span>
          <span class="bs-dr-connect__chip is-out">Approvals</span>
          <span class="bs-dr-connect__chip is-out">Notifications</span>
          <span class="bs-dr-connect__chip is-out">Audit Log</span>
        </div>
      </div>
      ${tagChips(copy.integrations)}
      ${copy.integNote ? `<p class="bs-note">${escapeHtml(copy.integNote)}</p>` : ""}
    </div></section>`;
  }

  html += internalToolsExtensionsHtml(copy);

  if (copy.scopes?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-it-scope-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.scopeLabel || "SCOPE LEVELS")}</p>
      <h2 class="bs-title" id="bs-it-scope-title">${escapeHtml(copy.scopeTitle || "")}</h2>
      ${copy.scopeLead ? `<p class="bs-lead">${escapeHtml(copy.scopeLead)}</p>` : ""}
      <div class="bs-scope bs-scope--levels bs-scope--cards">${copy.scopes
        .map(
          (s, i) =>
            `<article class="bs-scope__col"><p class="bs-scope__k"><span class="bs-scope__lvl">${pad2(i + 1)}</span>${escapeHtml(s.t)}</p><ul class="bs-scope__list">${(s.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  if (copy.secItems?.length) {
    html += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-it-sec-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.secLabel || "SECURITY")}</p>
      <h2 class="bs-title" id="bs-it-sec-title">${escapeHtml(copy.secTitle || "")}</h2>
      ${copy.secLead ? `<p class="bs-lead">${escapeHtml(copy.secLead)}</p>` : ""}
      <div class="bs-quality">${copy.secItems
        .map(
          (title, i) =>
            `<article class="bs-quality__item"><span class="bs-quality__n">${pad2(i + 1)}</span><h3>${escapeHtml(title)}</h3></article>`
        )
        .join("")}</div>
    </div></section>`;
  }

  html += engagementSectionHtml(copy, timelines, {
    id: "bs-it-engage-title",
    priceNameDefault: "INTERNAL TOOLS",
  });

  if (processDetail.length) {
    html += `<section class="bs-section" data-bs-reveal id="process" aria-labelledby="bs-it-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.processLabel || "PROCESS")}</p>
      <h2 class="bs-title" id="bs-it-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${internalToolsProcessHtml(processDetail)}
    </div></section>`;
  }

  if (copy.deliverItems?.length) {
    html += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-it-deliver-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.delLabel || "DELIVERABLES")}</p>
      <h2 class="bs-title" id="bs-it-deliver-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${copy.deliverLead ? `<p class="bs-lead">${escapeHtml(copy.deliverLead)}</p>` : ""}
      ${deliverGridHtml(copy.deliverItems, copy.deliverExtras)}
    </div></section>`;
  }

  return html;
}

function studioBoundaryNoteHtml(slug, lang) {
  const build = new Set(["mvp", "web", "landing", "app"]);
  if (!build.has(slug)) return "";
  const isKo = lang === "ko" || String(lang || "").startsWith("ko");
  const studioLine = isKo
    ? "Studio Digital: UI/UX 및 디자인 결과물이 필요한 프로젝트"
    : "Studio Digital: for UI/UX and design deliverables";
  const bizLine = isKo
    ? "Business BUILD: 실제 구현·개발·연동·배포가 필요한 프로젝트"
    : "Business BUILD: for implementation, development, integration, and deployment";
  const pairs = {
    web: isKo
      ? "Website Development(구현)과 Studio Web Design(디자인)은 범위가 다릅니다."
      : "Website Development (build) differs from Studio Web Design (design).",
    landing: isKo
      ? "Landing Page Development(구현)과 Studio Landing Page Design(디자인)은 범위가 다릅니다."
      : "Landing Page Development (build) differs from Studio Landing Page Design (design).",
    app: isKo
      ? "App Prototype(구현·프로토타입)과 Studio App UI/UX(디자인)는 범위가 다릅니다."
      : "App Prototype (build/prototype) differs from Studio App UI/UX (design).",
    mvp: isKo
      ? "MVP는 핵심 기능 구현·검증 중심이며, 디자인만 필요한 경우 Studio를 이용해 주세요."
      : "MVP focuses on building and validating core features; use Studio when you need design-only work.",
  };
  const specific = pairs[slug] || "";
  return `<section class="bs-section" data-bs-reveal aria-label="Business and Studio"><div class="bs-inner">
    <p class="bs-note bs-note--emph">${escapeHtml(bizLine)} · ${escapeHtml(studioLine)}</p>
    ${specific ? `<p class="bs-note">${escapeHtml(specific)}</p>` : ""}
  </div></section>`;
}

function extrasFor(slug, copy) {
  switch (slug) {
    case "mvp":
      return mvpDetailExtras(copy);
    case "web":
      return webDetailExtras(copy);
    case "landing":
      return landingDetailExtras(copy);
    case "app":
      return appDetailExtras(copy);
    case "ai-automation":
      return aiAutomationDetailExtras(copy);
    case "white-label":
      return whiteLabelDetailExtras(copy);
    case "data-reporting":
      return dataReportingExtras(copy);
    case "internal-tools":
      return internalToolsExtras(copy);
    case "market-research":
      return marketResearchExtras(copy);
    case "competitor-analysis":
      return competitorAnalysisExtras(copy);
    case "consumer-research":
      return consumerResearchExtras(copy);
    case "ux-audit":
      return uxAuditExtras(copy);
    case "trend-research":
      return trendResearchExtras(copy);
    case "custom-product":
      return customProductExtras(copy);
    case "product-launch":
      return productLaunchExtras(copy);
    case "internal-system":
      return internalSystemExtras(copy);
    case "workflow-automation":
      return workflowAutomationExtras(copy);
    case "design":
      return designExtras(copy);
    default:
      return "";
  }
}

function buildBody(page, copy, copies) {
  const inq = inquiryHref(page);
  const processId = "process";
  const skipCommonProcess = false;
  const landingDetail = new Set([
    "data-reporting",
    "workflow-automation",
    "internal-tools",
    "market-research",
    "competitor-analysis",
    "consumer-research",
    "ux-audit",
    "trend-research",
    "custom-product",
    "product-launch",
    "internal-system",
    "mvp",
    "web",
    "landing",
    "app",
    "ai-automation",
    "white-label",
  ]);
  const secondaryHref = copy.ctaSecondaryHref || `#${processId}`;

  let mid = "";
  mid += studioBoundaryNoteHtml(page.slug, copy._pageLang || "en");

  if (copy.solveItems?.length && !landingDetail.has(page.slug)) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-solve-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.solveEyebrow || "WHAT WE SOLVE")}</p>
      <h2 class="bs-title" id="bs-solve-title">${brHeadline(copy.solveTitle || "")}</h2>
      ${copy.solveLead ? `<p class="bs-lead">${escapeHtml(copy.solveLead)}</p>` : ""}
      ${listNumbered(copy.solveItems, "bs-solve", "signal")}
    </div></section>`;
  }

  if (copy.getItems?.length && !landingDetail.has(page.slug) && page.slug !== "design" && page.slug !== "white-label" && page.slug !== "ai-automation") {
    mid += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-get-title"><div class="bs-inner">
      <p class="bs-eyebrow">${escapeHtml(copy.getEyebrow || "WHAT YOU GET")}</p>
      <h2 class="bs-title" id="bs-get-title">${escapeHtml(copy.getTitle || "")}</h2>
      ${listNumbered(copy.getItems, "bs-get", "catalog")}
    </div></section>`;
  }

  mid += extrasFor(page.slug, copy);

  if (copy.processItems?.length && !skipCommonProcess && !landingDetail.has(page.slug)) {
    mid += `<section class="bs-section" data-bs-reveal id="${processId}" aria-labelledby="bs-process-title"><div class="bs-inner">
      <p class="bs-eyebrow">PROCESS</p>
      <h2 class="bs-title" id="bs-process-title">${escapeHtml(copy.processTitle || "")}</h2>
      ${processList(copy.processItems)}
    </div></section>`;
  }

  if (copy.deliverItems?.length && !landingDetail.has(page.slug)) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-del-title"><div class="bs-inner">
      <p class="bs-eyebrow">DELIVERABLES</p>
      <h2 class="bs-title" id="bs-del-title">${escapeHtml(copy.deliverTitle || "")}</h2>
      ${copy.deliverLead ? `<p class="bs-lead">${escapeHtml(copy.deliverLead)}</p>` : ""}
      ${chips(copy.deliverItems)}
      ${copy.deliverExtras?.length ? tagChips(copy.deliverExtras) : ""}
    </div></section>`;
  }

  if (copy.whoItems?.length) {
    mid += `<section class="bs-section bs-section--surface" data-bs-reveal aria-labelledby="bs-who-title"><div class="bs-inner">
      <p class="bs-eyebrow">WHO IT'S FOR</p>
      <h2 class="bs-title" id="bs-who-title">${escapeHtml(copy.whoTitle || "")}</h2>
      ${whoList(copy.whoItems)}
    </div></section>`;
  }

  if (copy.faqs?.length) {
    mid += `<section class="bs-section" data-bs-reveal aria-labelledby="bs-faq-title"><div class="bs-inner">
      <p class="bs-eyebrow">FAQ</p>
      <h2 class="bs-title" id="bs-faq-title">${escapeHtml(copy.faqTitle || "FAQ")}</h2>
      ${faqHtml(copy.faqs)}
    </div></section>`;
  }

  mid += `<section class="bs-section bs-section--dark bs-final" data-bs-reveal aria-labelledby="bs-final-title"><div class="bs-inner">
    ${copy.finalLabel ? `<p class="bs-eyebrow">${escapeHtml(copy.finalLabel)}</p>` : ""}
    <h2 class="bs-final__title" id="bs-final-title">${brHeadline(copy.ctaFinalTitle || "")}</h2>
    ${copy.ctaFinalLead ? `<p class="bs-lead">${escapeHtml(copy.ctaFinalLead)}</p>` : ""}
    <div class="bs-hero__actions">
      <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="final" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaFinalBtn || copy.ctaPrimary)}</a>
      ${copy.ctaFinalSecondary ? `<a class="bs-btn bs-btn--ghost" href="${escapeHtml(copy.ctaFinalSecondaryHref || "../automation/")}">${escapeHtml(copy.ctaFinalSecondary)}</a>` : ""}
    </div>
  </div></section>`;

  mid += adjacentHtml(page, copy, copies);

  return `${breadcrumb(copy, page)}
<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${escapeHtml(copy.eyebrow || "")}${copy.subEyebrow ? `<span class="bs-eyebrow__sep" aria-hidden="true">·</span><span class="bs-eyebrow__sub">${escapeHtml(copy.subEyebrow)}</span>` : ""}</p>
      <h1 class="bs-hero__title" id="bs-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="bs-hero__lead">${escapeHtml(copy.lead || "")}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="${inq}" data-bs-cta="hero_primary" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaPrimary || "")}</a>
        <a class="bs-btn bs-btn--ghost" href="${secondaryHref}" data-bs-cta="hero_secondary">${escapeHtml(copy.ctaSecondary || "")}</a>
      </div>
    </div>
    ${businessHeroVisual(page.visual, page.slug)}
  </div>
</section>
${serviceNav(page, copies)}
${mid}`;
}

function writeRedirect(page) {
  const slug = typeof page === "string" ? page : page.slug;
  const route = typeof page === "string" ? page : pageRoute(page);
  const target = `/en/business/${route}/`;
  const dir = path.join(ROOT, "business", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>Redirect</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`
  );
}

function outDirFor(page, langDir) {
  return path.join(ROOT, langDir, "business", ...pageRoute(page).split("/"));
}

function writeLegacyAutomationRedirects() {
  const slugs = ["data-reporting", "internal-tools"];
  for (const slug of slugs) {
    for (const { dir } of LANGS) {
      const legacyDir = path.join(ROOT, dir, "business", "automation", slug);
      fs.mkdirSync(legacyDir, { recursive: true });
      const target = `/${dir}/business/${slug}/`;
      fs.writeFileSync(
        path.join(legacyDir, "index.html"),
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>Redirect</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`
      );
      const pubLegacy = path.join(ROOT, "_publish", dir, "business", "automation", slug);
      if (fs.existsSync(path.join(ROOT, "_publish"))) {
        fs.mkdirSync(pubLegacy, { recursive: true });
        fs.copyFileSync(path.join(legacyDir, "index.html"), path.join(pubLegacy, "index.html"));
      }
    }
  }
}

export function renderBusinessServices() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = dir;
    const copies = Object.fromEntries(BUSINESS_SERVICE_PAGES.map((p) => [p.slug, getServiceCopy(p.slug, lang)]));

    for (const page of BUSINESS_SERVICE_PAGES) {
      if (page.customPage) continue;
      const copy = copies[page.slug];
      const route = pageRoute(page);
      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/business/${route}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(page));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy.seoTitle || ""));
      html = html.replace(
        /\{\{META_DESCRIPTION\}\}/g,
        escapeHtml(clampSeoDescription(copy.metaDescription || ""))
      );
      html = html.replace(/\{\{SERVICE_SLUG\}\}/g, page.slug);
      html = html.replace(/\{\{ANALYTICS_ID\}\}/g, page.analyticsId);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, buildBody(page, copy, copies));
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: chromeBase(page) });

      const outDir = outDirFor(page, dir);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  for (const page of BUSINESS_SERVICE_PAGES) {
    if (page.customPage) continue;
    writeRedirect(page);
  }
  writeLegacyAutomationRedirects();

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      for (const page of BUSINESS_SERVICE_PAGES) {
        if (page.customPage) continue;
        const routeParts = pageRoute(page).split("/");
        const src = path.join(ROOT, dir, "business", ...routeParts, "index.html");
        const destDir = path.join(pub, dir, "business", ...routeParts);
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, path.join(destDir, "index.html"));
      }
    }
    for (const page of BUSINESS_SERVICE_PAGES) {
      if (page.customPage) continue;
      const src = path.join(ROOT, "business", page.slug, "index.html");
      const destDir = path.join(pub, "business", page.slug);
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
    fs.copyFileSync(path.join(ROOT, "business-service.css"), path.join(pub, "business-service.css"));
    fs.copyFileSync(path.join(ROOT, "business-service.js"), path.join(pub, "business-service.js"));
  }

  console.log(
    `render-business-services: ${BUSINESS_SERVICE_PAGES.filter((p) => !p.customPage).length} services × ${LANGS.length} langs`
  );
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("render-business-services.mjs")) {
  renderBusinessServices();
}
