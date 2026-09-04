#!/usr/bin/env node
/**
 * Newon production monitoring — read-only synthetic checks.
 *
 * GET/HEAD only. No form POST, no auth, no Firestore, no PII logging.
 *
 * Usage:
 *   node scripts/monitoring/check-production.mjs
 *   node scripts/monitoring/check-production.mjs --smoke
 *   node scripts/monitoring/check-production.mjs --no-store --report-only
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { APPS } from "../production-health/config.mjs";
import { loadStoreUrls, isDeveloperAppStoreUrl } from "../production-health/lib/inventory.mjs";
import {
  CRITICAL_ASSETS,
  CRITICAL_ROUTES,
  DEFAULTS,
  GITHUB_PAGES_404,
  SMOKE_ROUTE_IDS,
  SOFT_404_MARKERS,
  USER_AGENT,
  allRouteTargets,
} from "./targets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "../..");

const STATUS = { PASS: "PASS", WARN: "WARN", FAIL: "FAIL", UNKNOWN: "UNKNOWN" };
const CLASS = {
  OUTAGE: "OUTAGE",
  DEGRADED: "DEGRADED",
  EXTERNAL: "EXTERNAL",
  MONITORING_ERROR: "MONITORING_ERROR",
  OK: "OK",
};

function parseArgs(argv) {
  const opts = {
    origin: process.env.NEWON_SITE_ORIGIN || DEFAULTS.origin,
    smoke: false,
    store: true,
    reportOnly: false,
    outDir: path.join(REPO_ROOT, "reports"),
    timeoutMs: Number(process.env.NEWON_MONITOR_TIMEOUT_MS || DEFAULTS.timeoutMs),
    retries: Number(process.env.NEWON_MONITOR_RETRIES || DEFAULTS.retries),
    concurrency: Number(process.env.NEWON_MONITOR_CONCURRENCY || DEFAULTS.concurrency),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--smoke") opts.smoke = true;
    else if (a === "--store") opts.store = true;
    else if (a === "--no-store") opts.store = false;
    else if (a === "--report-only") opts.reportOnly = true;
    else if (a === "--origin" && argv[i + 1]) opts.origin = argv[++i].replace(/\/$/, "");
    else if (a === "--out-dir" && argv[i + 1]) opts.outDir = path.resolve(argv[++i]);
    else if (a === "--timeout-ms" && argv[i + 1]) opts.timeoutMs = Number(argv[++i]);
    else if (a === "--help" || a === "-h") {
      console.log(`Usage: node scripts/monitoring/check-production.mjs [options]
  --smoke          Critical post-deploy routes only (no store, no supporting)
  --store          Probe App Store / Play URLs (default on for full run)
  --no-store       Skip store probes
  --report-only    Always exit 0 (artifact / post-deploy warn mode)
  --origin URL     Default ${DEFAULTS.origin}
  --out-dir DIR    Write monitoring-latest.json/.md
  --timeout-ms N   Per-request timeout`);
      process.exit(0);
    }
  }
  if (opts.smoke) opts.store = false;
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function rankStatus(s) {
  return { FAIL: 0, WARN: 1, UNKNOWN: 2, PASS: 3 }[s] ?? 2;
}

function worstStatus(list) {
  return list.reduce((a, b) => (rankStatus(a) <= rankStatus(b) ? a : b), STATUS.PASS);
}

/**
 * Bounded concurrency map.
 * @template T,R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  const n = Math.min(limit, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

/**
 * @param {string} url
 * @param {{ method?: string, timeoutMs: number, readBody?: boolean }} opts
 */
async function requestOnce(url, { method = "GET", timeoutMs, readBody = true, redirect = "follow" }) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      redirect,
      signal: ctrl.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - started;
    const redirectLocation = res.headers.get("location") || null;
    let body = "";
    let bytes = 0;
    if (method !== "HEAD") {
      const text = await res.text();
      bytes = Buffer.byteLength(text, "utf8");
      if (readBody) {
        body = text.length > 500_000 ? text.slice(0, 500_000) : text;
      }
    }
    return {
      ok: true,
      status: res.status,
      latencyMs,
      redirectLocation,
      body,
      bytes,
      finalUrl: res.url || url,
    };
  } catch (e) {
    clearTimeout(timer);
    const latencyMs = Date.now() - started;
    const name = e?.name || "Error";
    const aborted = name === "AbortError";
    return {
      ok: false,
      status: 0,
      latencyMs,
      redirectLocation: null,
      body: "",
      bytes: 0,
      error: aborted ? "timeout" : "network",
      errorName: name,
      finalUrl: url,
    };
  }
}

async function requestFollow(url, { timeoutMs }) {
  const res = await requestOnce(url, { timeoutMs, readBody: true, redirect: "follow" });
  return { ...res, redirectChain: [], url: res.finalUrl || url };
}

function soft404Detected(body) {
  if (!body) return false;
  for (const m of SOFT_404_MARKERS) {
    if (body.includes(m)) return true;
  }
  if (GITHUB_PAGES_404.every((m) => body.includes(m))) return true;
  return false;
}

function latencyStatus(ms) {
  if (ms > DEFAULTS.latencyFailMs) return STATUS.WARN; // time-only never OUTAGE
  if (ms > DEFAULTS.latencyWarnMs) return STATUS.WARN;
  return STATUS.PASS;
}

function makeCheck(partial) {
  return {
    id: partial.id,
    type: partial.type || "http",
    level: partial.level,
    severity: partial.severityity || "P2",
    target: partial.target,
    status: partial.status,
    httpStatus: partial.httpStatus ?? null,
    latencyMs: partial.latencyMs ?? null,
    attempts: partial.attempts ?? 1,
    classification: partial.classification || CLASS.OK,
    reason: partial.reason || "",
    details: partial.details || {},
  };
}

function logLine(check) {
  const lat = check.latencyMs != null ? `${check.latencyMs}ms` : "-";
  const http = check.httpStatus != null ? String(check.httpStatus) : "-";
  console.log(
    `[${check.status}] ${check.id} http=${http} latency=${lat} class=${check.classification} — ${check.reason}`
  );
}

/**
 * Retry wrapper for FAIL candidates only.
 */
async function withRetry(fn, retries, delayMs) {
  let last = await fn();
  let attempts = 1;
  while (
    attempts <= retries &&
    (last.status === STATUS.FAIL ||
      (last.classification === CLASS.MONITORING_ERROR && last.status === STATUS.UNKNOWN))
  ) {
    await sleep(delayMs);
    last = await fn();
    attempts++;
  }
  last.attempts = attempts;
  return last;
}

async function checkRoute(target, opts) {
  const url = `${opts.origin}${target.path}`;

  if (target.type === "http/404-behavior") {
    return withRetry(async () => {
      const res = await requestFollow(url, { timeoutMs: opts.timeoutMs });
      if (!res.ok && res.error === "timeout") {
        return makeCheck({
          id: target.id,
          type: target.type,
          level: target.level,
          severity: target.severityity,
          target: url,
          status: STATUS.WARN,
          httpStatus: 0,
          latencyMs: res.latencyMs,
          classification: CLASS.MONITORING_ERROR,
          reason: "404-behavior probe timed out (monitoring/network)",
        });
      }
      if (!res.ok) {
        return makeCheck({
          id: target.id,
          type: target.type,
          level: target.level,
          severity: target.severityity,
          target: url,
          status: STATUS.UNKNOWN,
          latencyMs: res.latencyMs,
          classification: CLASS.MONITORING_ERROR,
          reason: `404-behavior probe network error (${res.error})`,
        });
      }
      const looks404 =
        res.status === 404 || soft404Detected(res.body) || (res.status === 200 && soft404Detected(res.body));
      if (looks404 || res.status === 404) {
        return makeCheck({
          id: target.id,
          type: target.type,
          level: target.level,
          severity: target.severityity,
          target: url,
          status: STATUS.PASS,
          httpStatus: res.status,
          latencyMs: res.latencyMs,
          classification: CLASS.OK,
          reason: `Missing path returns expected not-found behavior (HTTP ${res.status})`,
        });
      }
      return makeCheck({
        id: target.id,
        type: target.type,
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.WARN,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.DEGRADED,
        reason: `Missing path returned unexpected HTTP ${res.status} without 404 markers`,
      });
    }, opts.retries, DEFAULTS.retryDelayMs);
  }

  return withRetry(async () => {
    const res = await requestFollow(url, { timeoutMs: opts.timeoutMs });

    if (!res.ok) {
      const isTimeout = res.error === "timeout";
      if (!isTimeout) {
        return makeCheck({
          id: target.id,
          type: target.type || "http/content",
          level: target.level,
          severity: target.severityity,
          target: url,
          status: STATUS.UNKNOWN,
          httpStatus: 0,
          latencyMs: res.latencyMs,
          classification: CLASS.MONITORING_ERROR,
          reason: `Network failure (${res.error}) — not confirmed production outage`,
        });
      }
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: 0,
        latencyMs: res.latencyMs,
        classification: target.level === "CRITICAL" ? CLASS.OUTAGE : CLASS.DEGRADED,
        reason: `Timeout after ${opts.timeoutMs}ms`,
      });
    }

    if (res.status >= 500) {
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: target.level === "CRITICAL" ? CLASS.OUTAGE : CLASS.DEGRADED,
        reason: `HTTP ${res.status}`,
      });
    }

    if (res.status >= 400) {
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: target.level === "CRITICAL" ? CLASS.OUTAGE : CLASS.DEGRADED,
        reason: `HTTP ${res.status}`,
      });
    }

    // Soft 404 on expected real pages
    if (soft404Detected(res.body)) {
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: target.level === "CRITICAL" ? CLASS.OUTAGE : CLASS.DEGRADED,
        reason: "Soft 404 / error page markers present with success status",
      });
    }

    if (target.minBytes && res.bytes < target.minBytes) {
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.DEGRADED,
        reason: `Response too small (${res.bytes}b < ${target.minBytes}b)`,
      });
    }

    const missing = [];
    for (const m of target.markers || []) {
      if (!res.body.includes(m)) missing.push(m);
    }
    if (target.anyMarkers?.length) {
      if (!target.anyMarkers.some((m) => res.body.includes(m))) {
        missing.push(`anyOf:[${target.anyMarkers.join("|")}]`);
      }
    }

    // Inquiry / contact: require form structure + endpoint configured in linked JS (asset check covers JS)
    if (target.id === "inquiry-ko") {
      if (!res.body.includes("bz-inquiry-form")) missing.push("bz-inquiry-form");
      if (!res.body.includes("/business/inquiry.js")) missing.push("inquiry.js script");
    }
    if (target.id === "contact-ko") {
      if (!res.body.includes("co-contact-form")) missing.push("co-contact-form");
      if (!res.body.includes("/company.js")) missing.push("company.js script");
    }

    if (missing.length) {
      return makeCheck({
        id: target.id,
        type: target.type || "http/content",
        level: target.level,
        severity: target.severityity,
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: target.level === "CRITICAL" ? CLASS.OUTAGE : CLASS.DEGRADED,
        reason: `Missing content markers: ${missing.slice(0, 3).join(", ")}`,
        details: { missingCount: missing.length },
      });
    }

    const lat = latencyStatus(res.latencyMs);
    const status = lat === STATUS.PASS ? STATUS.PASS : STATUS.WARN;
    return makeCheck({
      id: target.id,
      type: target.type || "http/content",
      level: target.level,
      severity: target.severityity,
      target: url,
      status,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
      classification: CLASS.OK,
      reason:
        status === STATUS.PASS
          ? `OK HTTP ${res.status}`
          : `OK HTTP ${res.status} but slow response (${res.latencyMs}ms)`,
      details: {
        bytes: res.bytes,
        redirects: res.redirectChain?.length || 0,
      },
    });
  }, opts.retries, DEFAULTS.retryDelayMs);
}

async function checkAsset(asset, opts) {
  const url = `${opts.origin}${asset.path}`;
  return withRetry(async () => {
    let res = await requestOnce(url, {
      method: "HEAD",
      timeoutMs: opts.timeoutMs,
      readBody: false,
      redirect: "follow",
    });
    // Some hosts block HEAD — safe GET fallback
    if (!res.ok || res.status === 405 || res.status === 403 || res.status === 501 || res.status >= 400) {
      res = await requestOnce(url, {
        method: "GET",
        timeoutMs: opts.timeoutMs,
        readBody: false,
        redirect: "follow",
      });
    }

    if (!res.ok) {
      return makeCheck({
        id: asset.id,
        type: "asset",
        level: "ASSET",
        severity: asset.severityity,
        target: url,
        status: res.error === "timeout" ? STATUS.FAIL : STATUS.UNKNOWN,
        latencyMs: res.latencyMs,
        classification: res.error === "timeout" ? CLASS.DEGRADED : CLASS.MONITORING_ERROR,
        reason: `Asset probe ${res.error}`,
      });
    }

    if (res.status >= 200 && res.status < 400) {
      return makeCheck({
        id: asset.id,
        type: "asset",
        level: "ASSET",
        severity: asset.severityity,
        target: url,
        status: STATUS.PASS,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.OK,
        reason: `Asset OK HTTP ${res.status}`,
      });
    }

    return makeCheck({
      id: asset.id,
      type: "asset",
      level: "ASSET",
      severity: asset.severityity,
      target: url,
      status: STATUS.FAIL,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
      classification: CLASS.DEGRADED,
      reason: `Asset HTTP ${res.status}`,
    });
  }, opts.retries, DEFAULTS.retryDelayMs);
}

/**
 * Store URL probe with GET fallback, rate-limit awareness, Newon+ exception.
 */
async function checkStoreUrl({ appId, store, url, optional }) {
  if (!url) {
    if (optional) {
      return makeCheck({
        id: `store-${appId}-${store}`,
        type: "store",
        level: "STORE",
        severity: "P2",
        target: "(none)",
        status: STATUS.PASS,
        classification: CLASS.OK,
        reason: `No ${store} URL (intentional / optional for ${appId})`,
      });
    }
    return makeCheck({
      id: `store-${appId}-${store}`,
      type: "store",
      level: "STORE",
      severity: "P2",
      target: "(none)",
      status: STATUS.WARN,
      classification: CLASS.DEGRADED,
      reason: `Missing ${store} URL in locales`,
    });
  }

  if (store === "appstore" && isDeveloperAppStoreUrl(url)) {
    return makeCheck({
      id: `store-${appId}-${store}`,
      type: "store",
      level: "STORE",
      severity: "P2",
      target: url,
      status: optional ? STATUS.PASS : STATUS.WARN,
      classification: optional ? CLASS.OK : CLASS.EXTERNAL,
      reason: optional
        ? "App Store developer page (intentional Newon+ exception — not FAIL)"
        : "App Store URL is developer page, not product listing",
    });
  }

  return withRetry(async () => {
    const timeoutMs = 10000;
    const res = await requestOnce(url, { method: "GET", timeoutMs, readBody: false, redirect: "follow" });

    if (!res.ok) {
      return makeCheck({
        id: `store-${appId}-${store}`,
        type: "store",
        level: "STORE",
        severity: "P2",
        target: url,
        status: STATUS.UNKNOWN,
        latencyMs: res.latencyMs,
        classification: CLASS.EXTERNAL,
        reason: `Store probe ${res.error} — not declaring dead listing from one failure`,
      });
    }

    if (res.status === 429 || res.status === 403) {
      return makeCheck({
        id: `store-${appId}-${store}`,
        type: "store",
        level: "STORE",
        severity: "P3",
        target: url,
        status: STATUS.WARN,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.EXTERNAL,
        reason: `Store rate-limit / block HTTP ${res.status} (not scored as dead listing)`,
      });
    }

    if (res.status === 404) {
      return makeCheck({
        id: `store-${appId}-${store}`,
        type: "store",
        level: "STORE",
        severity: "P1",
        target: url,
        status: STATUS.FAIL,
        httpStatus: 404,
        latencyMs: res.latencyMs,
        classification: CLASS.EXTERNAL,
        reason: "Store URL HTTP 404",
      });
    }

    if (res.status >= 200 && res.status < 400) {
      return makeCheck({
        id: `store-${appId}-${store}`,
        type: "store",
        level: "STORE",
        severity: "P2",
        target: url,
        status: STATUS.PASS,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.OK,
        reason: `Store OK HTTP ${res.status}`,
      });
    }

    return makeCheck({
      id: `store-${appId}-${store}`,
      type: "store",
      level: "STORE",
      severity: "P2",
      target: url,
      status: STATUS.WARN,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
      classification: CLASS.EXTERNAL,
      reason: `Store HTTP ${res.status}`,
    });
  }, 1, DEFAULTS.retryDelayMs);
}

async function checkInquiryEndpointConfigured(opts) {
  const url = `${opts.origin}/business/inquiry.js`;
  return withRetry(async () => {
    const res = await requestFollow(url, { timeoutMs: opts.timeoutMs });
    if (!res.ok) {
      return makeCheck({
        id: "inquiry-endpoint-config",
        type: "http/form-config",
        level: "CRITICAL",
        severity: "P1",
        target: url,
        status: res.error === "timeout" ? STATUS.FAIL : STATUS.UNKNOWN,
        classification: res.error === "timeout" ? CLASS.DEGRADED : CLASS.MONITORING_ERROR,
        reason: `Could not load inquiry.js (${res.error || res.status})`,
        latencyMs: res.latencyMs,
      });
    }
    const hasEndpoint =
      res.body.includes("formsubmit.co/ajax/") && res.body.includes("newon@newon.app");
    // Do NOT POST. Confirm config strings only.
    if (!hasEndpoint) {
      return makeCheck({
        id: "inquiry-endpoint-config",
        type: "http/form-config",
        level: "CRITICAL",
        severity: "P1",
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.DEGRADED,
        reason: "inquiry.js missing FormSubmit endpoint configuration markers",
      });
    }
    return makeCheck({
      id: "inquiry-endpoint-config",
      type: "http/form-config",
      level: "CRITICAL",
      severity: "P1",
      target: url,
      status: STATUS.PASS,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
      classification: CLASS.OK,
      reason: "Inquiry FormSubmit endpoint configured (delivery not tested)",
      details: { delivery: "MANUAL/EXTERNAL" },
    });
  }, opts.retries, DEFAULTS.retryDelayMs);
}

async function checkContactEndpointConfigured(opts) {
  const url = `${opts.origin}/company.js`;
  return withRetry(async () => {
    const res = await requestFollow(url, { timeoutMs: opts.timeoutMs });
    if (!res.ok) {
      return makeCheck({
        id: "contact-endpoint-config",
        type: "http/form-config",
        level: "CRITICAL",
        severity: "P1",
        target: url,
        status: res.error === "timeout" ? STATUS.WARN : STATUS.UNKNOWN,
        classification: CLASS.MONITORING_ERROR,
        reason: `Could not load company.js (${res.error || res.status})`,
        latencyMs: res.latencyMs,
      });
    }
    const hasEndpoint =
      res.body.includes("formsubmit.co/ajax/") && res.body.includes("newon@newon.app");
    if (!hasEndpoint) {
      return makeCheck({
        id: "contact-endpoint-config",
        type: "http/form-config",
        level: "CRITICAL",
        severity: "P1",
        target: url,
        status: STATUS.FAIL,
        httpStatus: res.status,
        latencyMs: res.latencyMs,
        classification: CLASS.DEGRADED,
        reason: "company.js missing FormSubmit endpoint configuration markers",
      });
    }
    return makeCheck({
      id: "contact-endpoint-config",
      type: "http/form-config",
      level: "CRITICAL",
      severity: "P1",
      target: url,
      status: STATUS.PASS,
      httpStatus: res.status,
      latencyMs: res.latencyMs,
      classification: CLASS.OK,
      reason: "Contact FormSubmit endpoint configured (delivery not tested)",
      details: { delivery: "MANUAL/EXTERNAL" },
    });
  }, opts.retries, DEFAULTS.retryDelayMs);
}

function selectRoutes(opts) {
  if (opts.smoke) {
    return CRITICAL_ROUTES.filter((r) => SMOKE_ROUTE_IDS.has(r.id));
  }
  return allRouteTargets();
}

function classifyOverall(checks) {
  const criticalFails = checks.filter(
    (c) => c.status === STATUS.FAIL && (c.level === "CRITICAL" || c.classification === CLASS.OUTAGE)
  );
  const externalFails = checks.filter(
    (c) => c.status === STATUS.FAIL && c.classification === CLASS.EXTERNAL
  );
  const degradedFails = checks.filter(
    (c) => c.status === STATUS.FAIL && c.classification === CLASS.DEGRADED
  );
  const monitorErrors = checks.filter((c) => c.classification === CLASS.MONITORING_ERROR);

  let failureClass = CLASS.OK;
  if (criticalFails.length) failureClass = CLASS.OUTAGE;
  else if (degradedFails.length) failureClass = CLASS.DEGRADED;
  else if (externalFails.length) failureClass = CLASS.EXTERNAL;
  else if (monitorErrors.some((c) => c.status !== STATUS.PASS)) failureClass = CLASS.MONITORING_ERROR;

  const overallStatus = worstStatus(checks.map((c) => c.status));
  return { overallStatus, failureClass };
}

function toMarkdown(report) {
  const lines = [
    `# Newon production monitoring`,
    ``,
    `- Generated: ${report.generatedAt}`,
    `- Origin: ${report.origin}`,
    `- Mode: ${report.mode}`,
    `- Overall: **${report.overallStatus}** (${report.failureClass})`,
    `- Summary: pass=${report.summary.pass} warn=${report.summary.warn} fail=${report.summary.fail} unknown=${report.summary.unknown}`,
    ``,
    `## Checks`,
    ``,
    `| Status | ID | HTTP | Latency | Class | Reason |`,
    `| --- | --- | --- | --- | --- | --- |`,
  ];
  for (const c of report.checks) {
    const reason = String(c.reason || "").replace(/\|/g, "/");
    lines.push(
      `| ${c.status} | ${c.id} | ${c.httpStatus ?? "-"} | ${c.latencyMs ?? "-"}ms | ${c.classification} | ${reason} |`
    );
  }
  lines.push(
    ``,
    `## Notes`,
    ``,
    `- Read-only GET/HEAD. No form submission.`,
    `- FormSubmit delivery, Firebase Console, HQ Auth: MANUAL.`,
    `- On FAIL: verify → scope → latest deploy → severity → \`docs/operations/incident-checklist.md\`.`,
    ``
  );
  return lines.join("\n");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const routes = selectRoutes(opts);
  const checks = [];

  console.log(`Newon production monitor → ${opts.origin} (mode=${opts.smoke ? "smoke" : "full"})`);

  const routeChecks = await mapPool(routes, opts.concurrency, (t) => checkRoute(t, opts));
  for (const c of routeChecks) {
    checks.push(c);
    logLine(c);
  }

  if (!opts.smoke) {
    const assetChecks = await mapPool(CRITICAL_ASSETS, opts.concurrency, (a) => checkAsset(a, opts));
    for (const c of assetChecks) {
      checks.push(c);
      logLine(c);
    }

    const inquiryCfg = await checkInquiryEndpointConfigured(opts);
    checks.push(inquiryCfg);
    logLine(inquiryCfg);

    const contactCfg = await checkContactEndpointConfigured(opts);
    checks.push(contactCfg);
    logLine(contactCfg);
  } else {
    // smoke still verifies inquiry form marker via route; endpoint config is cheap and critical
    const inquiryCfg = await checkInquiryEndpointConfigured(opts);
    checks.push(inquiryCfg);
    logLine(inquiryCfg);
  }

  if (opts.store) {
    console.log("Store probes (sequential, rate-limit aware)…");
    for (const app of APPS) {
      const stores = loadStoreUrls(app, "en");
      const play = await checkStoreUrl({
        appId: app.id,
        store: "play",
        url: stores.googlePlayUrl,
        optional: false,
      });
      checks.push(play);
      logLine(play);
      await sleep(DEFAULTS.storeDelayMs);

      const iosOptional = !!app.storeAppStoreOptional || stores.appStoreIsDeveloper;
      const ios = await checkStoreUrl({
        appId: app.id,
        store: "appstore",
        url: stores.appStoreUrl,
        optional: iosOptional,
      });
      checks.push(ios);
      logLine(ios);
      await sleep(DEFAULTS.storeDelayMs);
    }
  }

  const { overallStatus, failureClass } = classifyOverall(checks);
  const summary = {
    pass: checks.filter((c) => c.status === STATUS.PASS).length,
    warn: checks.filter((c) => c.status === STATUS.WARN).length,
    fail: checks.filter((c) => c.status === STATUS.FAIL).length,
    unknown: checks.filter((c) => c.status === STATUS.UNKNOWN).length,
  };

  const report = {
    generatedAt: startedAt,
    finishedAt: new Date().toISOString(),
    origin: opts.origin,
    mode: opts.smoke ? "smoke" : "full",
    overallStatus,
    failureClass,
    summary,
    privacy: {
      methods: ["GET", "HEAD"],
      noFormSubmit: true,
      noAuth: true,
      noPiiLogged: true,
    },
    gaps: {
      clientRuntimeErrors: "MISSING / FUTURE OPTION (no Sentry vendor in this phase)",
      analyticsAnomaly: "FUTURE (store_click / inquiry_success drop signals)",
      firebaseConsole: "MANUAL",
      formSubmitDelivery: "MANUAL / EXTERNAL",
      hqAuthData: "MANUAL",
    },
    checks,
  };

  fs.mkdirSync(opts.outDir, { recursive: true });
  const jsonPath = path.join(opts.outDir, "monitoring-latest.json");
  const mdPath = path.join(opts.outDir, "monitoring-latest.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(mdPath, toMarkdown(report));
  console.log(`Wrote ${path.relative(REPO_ROOT, jsonPath)}`);
  console.log(`Wrote ${path.relative(REPO_ROOT, mdPath)}`);
  console.log(`Overall ${overallStatus} (${failureClass}) — ${JSON.stringify(summary)}`);

  if (opts.reportOnly) process.exit(0);
  if (overallStatus === STATUS.FAIL && failureClass === CLASS.OUTAGE) process.exit(1);
  if (overallStatus === STATUS.FAIL) process.exit(1);
  process.exit(0);
}

main().catch((err) => {
  console.error("[MONITORING_ERROR]", err?.message || err);
  // Never dump stacks with potential env into artifacts beyond message
  process.exit(2);
});
