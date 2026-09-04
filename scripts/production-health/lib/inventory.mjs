import fs from "fs";
import path from "path";
import { APPS, FLUTTER_ROOTS, REPO_ROOT } from "../config.mjs";

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function readLocale(lang = "en") {
  const p = path.join(REPO_ROOT, "locales", `${lang}.json`);
  if (!exists(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function isDeveloperAppStoreUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /apps\.apple\.com\/[^/]+\/developer\//i.test(url);
}

export function extractPlayPackageId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.searchParams.get("id");
  } catch {
    const m = String(url).match(/[?&]id=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
}

export function extractAppStoreId(url) {
  if (!url || isDeveloperAppStoreUrl(url)) return null;
  const m = String(url).match(/\/id(\d+)/i);
  return m ? m[1] : null;
}

export function resolveFlutterRoot(app) {
  if (FLUTTER_ROOTS[app.id] && exists(FLUTTER_ROOTS[app.id])) {
    return FLUTTER_ROOTS[app.id];
  }
  const envRoot = process.env.NEWON_APPS_ROOT;
  if (envRoot) {
    for (const name of app.flutterCandidateDirs || []) {
      const candidate = path.join(envRoot, name);
      if (exists(path.join(candidate, "pubspec.yaml"))) return candidate;
    }
  }
  // Sibling of this website repo
  const parent = path.dirname(REPO_ROOT);
  for (const name of app.flutterCandidateDirs || []) {
    const candidate = path.join(parent, name);
    if (exists(path.join(candidate, "pubspec.yaml"))) return candidate;
  }
  // Nested under repo (future)
  for (const name of app.flutterCandidateDirs || []) {
    const candidate = path.join(REPO_ROOT, "apps", name);
    if (exists(path.join(candidate, "pubspec.yaml"))) return candidate;
    const flat = path.join(REPO_ROOT, name);
    if (exists(path.join(flat, "pubspec.yaml"))) return flat;
  }
  return null;
}

export function websitePresence(app) {
  const rootDelete = path.join(REPO_ROOT, app.rootDeleteDir, "delete-account", "index.html");
  const koDelete = path.join(REPO_ROOT, "ko", app.webPathSegment, "delete-account", "index.html");
  const enDelete = path.join(REPO_ROOT, "en", app.webPathSegment, "delete-account", "index.html");
  const iconCandidates = [
    path.join(REPO_ROOT, `${app.portfolioSlug}-logo.png`),
    path.join(REPO_ROOT, `${app.webPathSegment}-logo.png`),
    path.join(REPO_ROOT, "ox-month-logo.png"),
    path.join(REPO_ROOT, "newon-plus-logo.png"),
  ];
  // Prefer known icons from portfolio catalog naming
  const iconMap = {
    "ox-month": "ox-month-logo.png",
    subping: "subping-logo.png",
    savy: "savy-logo.png",
    pillmate: "pillmate-logo.png",
    babylog: "babylog-logo.png",
    petlog: "petlog-logo.png",
    piggyup: "piggyup-logo.png",
    goalup: "goalup-logo.png",
    countup: "countup-logo.png",
    "newon-plus": "newon-plus-logo.png",
    myworld: "myworld-logo.png",
  };
  const iconRel = iconMap[app.id];
  const iconPath = iconRel ? path.join(REPO_ROOT, iconRel) : null;

  return {
    rootDeleteAccount: exists(rootDelete) ? rootDelete : null,
    localeDeleteAccountKo: exists(koDelete) ? koDelete : null,
    localeDeleteAccountEn: exists(enDelete) ? enDelete : null,
    icon: iconPath && exists(iconPath) ? iconPath : null,
    sourceInThisRepo: {
      flutter: false,
      websiteMarketing: true,
      deleteAccountPages: exists(koDelete) || exists(rootDelete),
    },
  };
}

export function loadStoreUrls(app, lang = "en") {
  const loc = readLocale(lang);
  const section = loc[app.localeNs] || {};
  const rawAppStore = section.appStoreUrl || "";
  const googlePlayUrl = section.googlePlayUrl || "";
  const appStoreIsDeveloper = isDeveloperAppStoreUrl(rawAppStore);
  const appStoreUrl = appStoreIsDeveloper ? rawAppStore : rawAppStore;
  return {
    appStoreUrl: appStoreUrl || "",
    appStoreIsDeveloper,
    googlePlayUrl,
    playPackageId: extractPlayPackageId(googlePlayUrl),
    appStoreId: extractAppStoreId(rawAppStore),
    privacyPolicyLinkLabel: section.privacyPolicyLink || null,
  };
}

export function buildInventory() {
  return APPS.map((app) => {
    const flutterRoot = resolveFlutterRoot(app);
    const web = websitePresence(app);
    const stores = loadStoreUrls(app, "en");
    return {
      id: app.id,
      name: app.name,
      platformExpected: "Flutter (consumer app; source not in this repo unless configured)",
      sourcePath: flutterRoot || "UNKNOWN — not found in this repository",
      flutterRoot,
      packageName: flutterRoot ? "see pubspec.yaml" : "UNKNOWN",
      androidApplicationId: app.androidApplicationId,
      iosBundleId: app.iosBundleId == null ? "UNKNOWN" : app.iosBundleId,
      website: web,
      stores,
      criticalFlows: app.criticalFlows,
      sensitiveData: app.sensitiveData,
      storeAppStoreOptional: !!app.storeAppStoreOptional,
      firebase: {
        connected: "UNKNOWN",
        project: "UNKNOWN",
        auth: "UNKNOWN",
        firestore: "UNKNOWN",
        storage: "UNKNOWN",
        functions: "UNKNOWN",
        analytics: "UNKNOWN",
        crashReporting: "UNKNOWN",
        push: "UNKNOWN",
        iap: "UNKNOWN",
      },
    };
  });
}
