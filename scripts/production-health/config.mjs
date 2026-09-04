/**
 * Production Health Check — app inventory (website SoT).
 * Flutter source lives outside this repo unless NEWON_APPS_ROOT / flutterRoots is set.
 * Do not invent IDs, store URLs, or Firebase projects.
 */

import path from "path";
import { fileURLToPath } from "url";

export const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Score weights (N/A categories excluded from denominator). */
export const SCORE_WEIGHTS = {
  build: 20,
  firebase: 20,
  security: 20,
  coreFlow: 15,
  payments: 10,
  errorMonitoring: 5,
  privacy: 5,
  store: 5,
};

/**
 * @typedef {object} AppDef
 * @property {string} id
 * @property {string} name
 * @property {string} portfolioSlug
 * @property {string} localeNs
 * @property {string} webPathSegment — /{lang}/{segment}/delete-account/
 * @property {string} rootDeleteDir — repo root redirect folder
 * @property {string} androidApplicationId — from public Play URLs / analytics map
 * @property {string|null} iosBundleId — UNKNOWN when not in website SoT
 * @property {string[]} criticalFlows
 * @property {boolean} sensitiveData — stricter privacy scrutiny
 * @property {boolean} [storeAppStoreOptional] — intentional missing App Store product URL
 * @property {string[]} [flutterCandidateDirs] — relative to NEWON_APPS_ROOT
 */

/** @type {AppDef[]} */
export const APPS = [
  {
    id: "ox-month",
    name: "OX MONTH",
    portfolioSlug: "ox-month",
    localeNs: "ox",
    webPathSegment: "oxmonth",
    rootDeleteDir: "oxmonth",
    androidApplicationId: "com.newon.ox.month",
    iosBundleId: null,
    criticalFlows: ["habit create", "daily O/X", "monthly history", "reminder"],
    sensitiveData: false,
    flutterCandidateDirs: ["ox-month", "oxmonth", "OX MONTH", "ox_month"],
  },
  {
    id: "subping",
    name: "SubPing",
    portfolioSlug: "subping",
    localeNs: "sp",
    webPathSegment: "subping",
    rootDeleteDir: "subping",
    androidApplicationId: "com.newon.subping",
    iosBundleId: null,
    criticalFlows: ["subscription create", "renewal data", "reminder"],
    sensitiveData: false,
    flutterCandidateDirs: ["subping", "SubPing"],
  },
  {
    id: "savy",
    name: "Savy",
    portfolioSlug: "savy",
    localeNs: "sv",
    webPathSegment: "savy",
    rootDeleteDir: "savy",
    androidApplicationId: "com.newon.savy",
    iosBundleId: null,
    criticalFlows: ["transaction", "totals", "persistence"],
    sensitiveData: false,
    flutterCandidateDirs: ["savy", "Savy", "SAVY"],
  },
  {
    id: "pillmate",
    name: "Pillmate",
    portfolioSlug: "pillmate",
    localeNs: "pm",
    webPathSegment: "pillmate",
    rootDeleteDir: "pillmate",
    androidApplicationId: "com.newon.pill.mate",
    iosBundleId: null,
    criticalFlows: ["medication create", "reminder", "family/data access"],
    sensitiveData: true,
    flutterCandidateDirs: ["pillmate", "Pillmate", "pill_mate"],
  },
  {
    id: "babylog",
    name: "BabyLog",
    portfolioSlug: "babylog",
    localeNs: "bl",
    webPathSegment: "babylog",
    rootDeleteDir: "babylog",
    androidApplicationId: "com.newon.babylog",
    iosBundleId: null,
    criticalFlows: ["child record", "family/data access"],
    sensitiveData: true,
    flutterCandidateDirs: ["babylog", "BabyLog"],
  },
  {
    id: "petlog",
    name: "PetLog",
    portfolioSlug: "petlog",
    localeNs: "pl",
    webPathSegment: "petlog",
    rootDeleteDir: "petlog",
    androidApplicationId: "com.newon.petlog",
    iosBundleId: null,
    criticalFlows: ["pet record", "family/data access"],
    sensitiveData: true,
    flutterCandidateDirs: ["petlog", "PetLog"],
  },
  {
    id: "piggyup",
    name: "PiggyUp",
    portfolioSlug: "piggyup",
    localeNs: "pu",
    webPathSegment: "piggyup",
    rootDeleteDir: "piggyup",
    androidApplicationId: "com.newon.piggyup",
    iosBundleId: null,
    criticalFlows: ["saving goal", "saved amount", "progress"],
    sensitiveData: false,
    flutterCandidateDirs: ["piggyup", "PiggyUp"],
  },
  {
    id: "goalup",
    name: "GoalUp",
    portfolioSlug: "goalup",
    localeNs: "gu",
    webPathSegment: "goalup",
    rootDeleteDir: "goalup",
    androidApplicationId: "goalup.newon.app",
    iosBundleId: null,
    criticalFlows: ["goal create", "progress", "challenge"],
    sensitiveData: false,
    flutterCandidateDirs: ["goalup", "GoalUp"],
  },
  {
    id: "countup",
    name: "CountUp",
    portfolioSlug: "countup",
    localeNs: "cu",
    webPathSegment: "countup",
    rootDeleteDir: "countup",
    androidApplicationId: "com.newon.countup",
    iosBundleId: null,
    criticalFlows: ["counter create", "count update", "persistence"],
    sensitiveData: false,
    flutterCandidateDirs: ["countup", "CountUp"],
  },
  {
    id: "newon-plus",
    name: "Newon+",
    portfolioSlug: "newon-plus",
    localeNs: "np",
    webPathSegment: "newon",
    rootDeleteDir: "newon",
    androidApplicationId: "com.newon.newon",
    iosBundleId: null,
    criticalFlows: ["account", "product access", "entitlement"],
    sensitiveData: false,
    storeAppStoreOptional: true,
    flutterCandidateDirs: ["newon-plus", "newon_plus", "NewonPlus", "newon"],
  },
  {
    id: "myworld",
    name: "My World",
    portfolioSlug: "myworld",
    localeNs: "mw",
    webPathSegment: "myworld",
    rootDeleteDir: "myworld",
    androidApplicationId: "com.newon.myworld",
    iosBundleId: null,
    criticalFlows: ["place/travel record", "persistence"],
    sensitiveData: false,
    flutterCandidateDirs: ["myworld", "my-world", "MyWorld"],
  },
];

export const SITE_SCOPE = {
  note:
    "This repository is the Newon public website (GitHub Pages). Consumer Flutter app sources are not vendored here.",
  hqFirebase: {
    projectIdHint: "newon-hq",
    rulesFile: "firestore.rules",
    appliesTo: "HQ admin only — not per-app consumer Firebase",
  },
  websiteAnalytics: {
    file: "analytics.js",
    ga4ConfiguredInRepo: false,
  },
};

/**
 * Optional map: app id → absolute path to Flutter project root.
 * Prefer env NEWON_APPS_ROOT + flutterCandidateDirs, or set paths here when cloning app repos locally.
 */
export const FLUTTER_ROOTS = {
  // "ox-month": "/absolute/path/to/ox-month",
};
