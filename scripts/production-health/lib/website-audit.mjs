import fs from "fs";
import path from "path";
import { REPO_ROOT } from "../config.mjs";
import { finding, STATUS } from "./status.mjs";
import { extractPlayPackageId, isDeveloperAppStoreUrl, loadStoreUrls, websitePresence } from "./inventory.mjs";

/**
 * Website-side checks available without Flutter source.
 */
export function auditWebsiteSurface(app) {
  const findings = [];
  const web = websitePresence(app);
  const stores = loadStoreUrls(app, "en");

  // Delete account
  if (web.localeDeleteAccountKo && web.localeDeleteAccountEn) {
    findings.push(
      finding(STATUS.PASS, "DELETE_ACCOUNT_PAGES", "Localized delete-account pages present (ko+en).", {
        category: "privacy",
        path: `ko/${app.webPathSegment}/delete-account/`,
      })
    );
  } else if (web.rootDeleteAccount || web.localeDeleteAccountKo) {
    findings.push(
      finding(STATUS.WARN, "DELETE_ACCOUNT_PARTIAL", "Delete-account page present but locale coverage incomplete.", {
        priority: "P1",
        category: "privacy",
      })
    );
  } else {
    findings.push(
      finding(STATUS.FAIL, "DELETE_ACCOUNT_MISSING", "No delete-account page found for this product.", {
        priority: "P1",
        category: "privacy",
      })
    );
  }

  // Icons
  if (web.icon) {
    findings.push(
      finding(STATUS.PASS, "MARKETING_ICON", "Marketing icon asset present on website.", {
        category: "store",
        path: path.relative(REPO_ROOT, web.icon),
      })
    );
  } else {
    findings.push(
      finding(STATUS.WARN, "MARKETING_ICON_MISSING", "Expected marketing icon not found in repo root.", {
        priority: "P3",
        category: "store",
      })
    );
  }

  // Play URL
  if (!stores.googlePlayUrl) {
    findings.push(
      finding(STATUS.FAIL, "PLAY_URL_MISSING", "googlePlayUrl missing in locales/en.json for this app.", {
        priority: "P1",
        category: "store",
      })
    );
  } else if (/example\.com|placeholder|TODO|your\.app/i.test(stores.googlePlayUrl)) {
    findings.push(
      finding(STATUS.FAIL, "PLAY_URL_PLACEHOLDER", "googlePlayUrl looks like a placeholder.", {
        priority: "P1",
        category: "store",
      })
    );
  } else {
    const pkg = stores.playPackageId;
    if (pkg && pkg !== app.androidApplicationId) {
      findings.push(
        finding(
          STATUS.FAIL,
          "PLAY_PACKAGE_MISMATCH",
          `Play URL package id "${pkg}" does not match expected "${app.androidApplicationId}".`,
          { priority: "P1", category: "store" }
        )
      );
    } else {
      findings.push(
        finding(STATUS.PASS, "PLAY_URL_PRESENT", "Google Play URL present and package id matches inventory.", {
          category: "store",
        })
      );
    }
  }

  // App Store URL
  if (!stores.appStoreUrl) {
    if (app.storeAppStoreOptional) {
      findings.push(
        finding(
          STATUS.UNKNOWN,
          "APP_STORE_INTENTIONAL_OR_UNKNOWN",
          "No App Store product URL (may be intentional for Newon+). Not scored as FAIL.",
          { priority: "P2", category: "store", manual: true }
        )
      );
    } else {
      findings.push(
        finding(STATUS.WARN, "APP_STORE_URL_MISSING", "appStoreUrl missing in locales/en.json.", {
          priority: "P1",
          category: "store",
        })
      );
    }
  } else if (stores.appStoreIsDeveloper) {
    if (app.storeAppStoreOptional) {
      findings.push(
        finding(
          STATUS.WARN,
          "APP_STORE_DEVELOPER_PAGE",
          "App Store URL points to developer page (not a product listing). Treated as intentional for this product.",
          { priority: "P2", category: "store" }
        )
      );
    } else {
      findings.push(
        finding(
          STATUS.FAIL,
          "APP_STORE_DEVELOPER_NOT_PRODUCT",
          "App Store URL is a developer page, not an app product URL.",
          { priority: "P1", category: "store" }
        )
      );
    }
  } else if (/example\.com|placeholder|TODO/i.test(stores.appStoreUrl)) {
    findings.push(
      finding(STATUS.FAIL, "APP_STORE_PLACEHOLDER", "appStoreUrl looks like a placeholder.", {
        priority: "P1",
        category: "store",
      })
    );
  } else {
    findings.push(
      finding(STATUS.PASS, "APP_STORE_URL_PRESENT", "App Store product URL present in locales.", {
        category: "store",
      })
    );
  }

  // Privacy / terms site pages (shared legal, not per-app legal confirmation)
  const privacyKo = path.join(REPO_ROOT, "ko", "privacy", "index.html");
  const termsKo = path.join(REPO_ROOT, "ko", "terms", "index.html");
  if (fs.existsSync(privacyKo)) {
    findings.push(
      finding(STATUS.PASS, "SITE_PRIVACY_PAGE", "Site privacy page exists (ko).", {
        category: "privacy",
        path: "ko/privacy/",
      })
    );
  } else {
    findings.push(
      finding(STATUS.WARN, "SITE_PRIVACY_MISSING", "ko/privacy/ not found.", {
        priority: "P1",
        category: "privacy",
      })
    );
  }
  if (fs.existsSync(termsKo)) {
    findings.push(
      finding(STATUS.PASS, "SITE_TERMS_PAGE", "Site terms page exists (ko).", {
        category: "privacy",
        path: "ko/terms/",
      })
    );
  } else {
    findings.push(
      finding(STATUS.UNKNOWN, "SITE_TERMS_UNKNOWN", "ko/terms/ not confirmed.", {
        category: "privacy",
        manual: true,
      })
    );
  }

  if (app.sensitiveData) {
    findings.push(
      finding(
        STATUS.WARN,
        "SENSITIVE_DATA_PRODUCT",
        "Product may process sensitive personal data. In-app privacy, family access, and retention need MANUAL review in Flutter source / Console.",
        { priority: "P1", category: "privacy", manual: true }
      )
    );
  }

  // Dimensions from website-only
  const storeStatuses = findings.filter((f) => f.category === "store").map((f) => f.status);
  const privacyStatuses = findings.filter((f) => f.category === "privacy").map((f) => f.status);

  return {
    findings,
    dims: {
      store: worst(storeStatuses),
      privacy: worst(privacyStatuses),
    },
    stores,
  };
}

function worst(list) {
  const rank = { FAIL: 0, WARN: 1, UNKNOWN: 2, PASS: 3, "N/A": 4 };
  const usable = list.filter((s) => s && s !== "N/A");
  if (!usable.length) return STATUS.UNKNOWN;
  return usable.reduce((a, b) => (rank[a] <= rank[b] ? a : b));
}

/**
 * Optional live HTTP probe for store URLs. Does not invent URLs.
 */
export async function probeStoreUrls(stores, { timeoutMs = 8000 } = {}) {
  const findings = [];
  const targets = [
    { key: "googlePlayUrl", url: stores.googlePlayUrl, code: "PLAY_HTTP" },
    {
      key: "appStoreUrl",
      url: stores.appStoreIsDeveloper ? "" : stores.appStoreUrl,
      code: "APPSTORE_HTTP",
    },
  ];

  for (const t of targets) {
    if (!t.url) continue;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(t.url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "user-agent": "NewonProductionHealthCheck/1.0" },
      });
      clearTimeout(timer);
      if (res.status >= 200 && res.status < 400) {
        findings.push(
          finding(STATUS.PASS, `${t.code}_OK`, `Store URL HTTP ${res.status}.`, {
            category: "store",
          })
        );
      } else if (res.status === 404) {
        findings.push(
          finding(STATUS.FAIL, `${t.code}_404`, `Store URL returned HTTP 404.`, {
            priority: "P1",
            category: "store",
          })
        );
      } else {
        findings.push(
          finding(STATUS.WARN, `${t.code}_STATUS`, `Store URL returned HTTP ${res.status}.`, {
            priority: "P2",
            category: "store",
            manual: true,
          })
        );
      }
    } catch (e) {
      findings.push(
        finding(STATUS.UNKNOWN, `${t.code}_PROBE_FAILED`, `Could not probe store URL (${e.name || "error"}).`, {
          category: "store",
          manual: true,
        })
      );
    }
  }
  return findings;
}

export function auditPackageIdConsistency(app, stores) {
  const findings = [];
  const pkg = extractPlayPackageId(stores.googlePlayUrl);
  if (pkg && pkg === app.androidApplicationId) {
    findings.push(
      finding(STATUS.PASS, "PACKAGE_ID_CONSISTENT", "Play package id consistent with inventory SoT.", {
        category: "store",
      })
    );
  }
  return findings;
}

export { isDeveloperAppStoreUrl };
