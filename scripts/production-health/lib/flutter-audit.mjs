import fs from "fs";
import path from "path";
import { finding, STATUS } from "./status.mjs";

function readText(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/**
 * Static Flutter project audit when source is available.
 * Never dumps secrets; only presence / structural signals.
 */
export function auditFlutterApp(app, flutterRoot) {
  const findings = [];
  const dims = {
    build: STATUS.UNKNOWN,
    firebase: STATUS.UNKNOWN,
    auth: STATUS.UNKNOWN,
    payments: STATUS.NA,
    errorMonitoring: STATUS.UNKNOWN,
    analytics: STATUS.UNKNOWN,
    coreFlow: STATUS.UNKNOWN,
  };

  if (!flutterRoot) {
    findings.push(
      finding(
        STATUS.UNKNOWN,
        "FLUTTER_SOURCE_MISSING",
        "Flutter app source not found in this website repo. Set NEWON_APPS_ROOT or config FLUTTER_ROOTS to enable build/Firebase/Auth/payment audits.",
        { priority: "P2", category: "build", manual: true }
      )
    );
    dims.build = STATUS.UNKNOWN;
    dims.firebase = STATUS.UNKNOWN;
    dims.coreFlow = STATUS.UNKNOWN;
    dims.payments = STATUS.UNKNOWN;
    dims.errorMonitoring = STATUS.UNKNOWN;
    dims.analytics = STATUS.UNKNOWN;
    return { findings, dims, meta: { flutterRoot: null } };
  }

  const pubspec = path.join(flutterRoot, "pubspec.yaml");
  if (!exists(pubspec)) {
    findings.push(
      finding(STATUS.FAIL, "PUBSPEC_MISSING", "pubspec.yaml missing at resolved Flutter root.", {
        priority: "P0",
        category: "build",
        path: flutterRoot,
      })
    );
    dims.build = STATUS.FAIL;
    return { findings, dims, meta: { flutterRoot } };
  }

  const pub = readText(pubspec);
  findings.push(
    finding(STATUS.PASS, "PUBSPEC_PRESENT", "pubspec.yaml present.", {
      category: "build",
      path: relativeSafe(flutterRoot, pubspec),
    })
  );

  const androidManifest = firstExisting([
    path.join(flutterRoot, "android/app/src/main/AndroidManifest.xml"),
  ]);
  const buildGradle = firstExisting([
    path.join(flutterRoot, "android/app/build.gradle"),
    path.join(flutterRoot, "android/app/build.gradle.kts"),
  ]);
  const iosPlist = firstExisting([
    path.join(flutterRoot, "ios/Runner/Info.plist"),
  ]);

  if (buildGradle) {
    findings.push(
      finding(STATUS.PASS, "ANDROID_BUILD_CONFIG", "Android build.gradle present.", {
        category: "build",
        path: relativeSafe(flutterRoot, buildGradle),
      })
    );
  } else {
    findings.push(
      finding(STATUS.WARN, "ANDROID_BUILD_CONFIG_MISSING", "Android app build.gradle not found.", {
        priority: "P1",
        category: "build",
      })
    );
  }

  if (iosPlist) {
    findings.push(
      finding(STATUS.PASS, "IOS_INFO_PLIST", "iOS Info.plist present.", {
        category: "build",
        path: relativeSafe(flutterRoot, iosPlist),
      })
    );
  } else {
    findings.push(
      finding(STATUS.WARN, "IOS_INFO_PLIST_MISSING", "iOS Info.plist not found.", {
        priority: "P1",
        category: "build",
      })
    );
  }

  dims.build =
    buildGradle && iosPlist ? STATUS.PASS : buildGradle || iosPlist ? STATUS.WARN : STATUS.FAIL;

  // Firebase signals
  const firebaseOptions = firstExisting([
    path.join(flutterRoot, "lib/firebase_options.dart"),
    path.join(flutterRoot, "lib/firebase_options.dart.bak"),
  ]);
  const googleServices = firstExisting([
    path.join(flutterRoot, "android/app/google-services.json"),
  ]);
  const googlePlist = firstExisting([
    path.join(flutterRoot, "ios/Runner/GoogleService-Info.plist"),
  ]);

  const deps = {
    auth: /firebase_auth/i.test(pub),
    firestore: /cloud_firestore/i.test(pub),
    storage: /firebase_storage/i.test(pub),
    functions: /cloud_functions/i.test(pub),
    messaging: /firebase_messaging/i.test(pub),
    analytics: /firebase_analytics/i.test(pub),
    crashlytics: /firebase_crashlytics/i.test(pub),
    core: /firebase_core/i.test(pub),
    iap: /in_app_purchase|purchases_flutter|revenuecat/i.test(pub),
  };

  if (deps.core || firebaseOptions || googleServices || googlePlist) {
    findings.push(
      finding(STATUS.PASS, "FIREBASE_SIGNALS", "Firebase client signals present (options and/or deps).", {
        category: "firebase",
      })
    );
    dims.firebase = STATUS.PASS;
  } else {
    findings.push(
      finding(STATUS.UNKNOWN, "FIREBASE_NOT_DETECTED", "No Firebase deps/options detected in static scan.", {
        category: "firebase",
        manual: true,
      })
    );
    dims.firebase = STATUS.UNKNOWN;
  }

  for (const [k, on] of Object.entries(deps)) {
    if (!on) continue;
    findings.push(
      finding(STATUS.PASS, `DEP_${k.toUpperCase()}`, `Dependency signal: ${k}.`, {
        category: k === "iap" ? "payments" : k === "crashlytics" ? "errorMonitoring" : "firebase",
      })
    );
  }

  dims.auth = deps.auth ? STATUS.PASS : STATUS.UNKNOWN;
  if (!deps.auth) {
    findings.push(
      finding(STATUS.UNKNOWN, "AUTH_NOT_DETECTED", "firebase_auth not listed in pubspec (may still use other auth).", {
        category: "auth",
        manual: true,
      })
    );
  }

  if (deps.iap) {
    dims.payments = STATUS.WARN;
    findings.push(
      finding(
        STATUS.WARN,
        "IAP_DEPS_PRESENT",
        "IAP dependency present — verify product IDs, restore, entitlements in App Store Connect / Play Console (MANUAL).",
        { priority: "P1", category: "payments", manual: true }
      )
    );
  } else {
    dims.payments = STATUS.NA;
    findings.push(
      finding(STATUS.NA, "IAP_NOT_DETECTED", "No in-app purchase dependency detected; payments scored N/A.", {
        category: "payments",
      })
    );
  }

  dims.errorMonitoring = deps.crashlytics ? STATUS.PASS : STATUS.WARN;
  if (!deps.crashlytics) {
    findings.push(
      finding(
        STATUS.WARN,
        "CRASHLYTICS_MISSING",
        "No Crashlytics dependency detected. Crash monitoring absent is WARN, not FAIL.",
        { priority: "P2", category: "errorMonitoring" }
      )
    );
  }

  dims.analytics = deps.analytics ? STATUS.PASS : STATUS.WARN;
  if (!deps.analytics) {
    findings.push(
      finding(STATUS.WARN, "ANALYTICS_SDK_MISSING", "No firebase_analytics in pubspec. Not auto-adding SDK.", {
        priority: "P3",
        category: "analytics",
      })
    );
  }

  // Debug remnants (production risk only)
  const libDir = path.join(flutterRoot, "lib");
  if (exists(libDir)) {
    const risky = scanDirForRiskyPatterns(libDir, flutterRoot);
    for (const r of risky) findings.push(r);
  }

  // Critical flows — static presence only
  const libBlob = exists(libDir) ? walkTexts(libDir, 80).join("\n") : "";
  let flowHits = 0;
  for (const flow of app.criticalFlows) {
    const token = flow.split(/[\s/]+/)[0];
    if (token && libBlob.toLowerCase().includes(token.toLowerCase())) flowHits++;
  }
  if (!libBlob) {
    dims.coreFlow = STATUS.UNKNOWN;
    findings.push(
      finding(STATUS.UNKNOWN, "CORE_FLOW_UNSCANNED", "lib/ not readable for critical-flow keyword scan.", {
        category: "coreFlow",
        manual: true,
      })
    );
  } else if (flowHits === 0) {
    dims.coreFlow = STATUS.UNKNOWN;
    findings.push(
      finding(
        STATUS.UNKNOWN,
        "CORE_FLOW_KEYWORDS_MISS",
        "Critical-flow keywords not matched in lib/ (flows may use different naming). Manual review required.",
        { priority: "P2", category: "coreFlow", manual: true }
      )
    );
  } else {
    dims.coreFlow = STATUS.WARN;
    findings.push(
      finding(
        STATUS.WARN,
        "CORE_FLOW_STATIC_ONLY",
        `Static keyword hits for ${flowHits}/${app.criticalFlows.length} critical flows — not a runtime proof.`,
        { priority: "P2", category: "coreFlow", manual: true }
      )
    );
  }

  return {
    findings,
    dims,
    meta: {
      flutterRoot,
      deps,
      firebaseOptions: !!firebaseOptions,
      googleServices: !!googleServices,
      googleServiceInfo: !!googlePlist,
      androidManifest: !!androidManifest,
    },
  };
}

function firstExisting(paths) {
  for (const p of paths) if (exists(p)) return p;
  return null;
}

function relativeSafe(root, p) {
  try {
    return path.relative(root, p);
  } catch {
    return p;
  }
}

function walkTexts(dir, maxFiles, out = [], count = { n: 0 }) {
  if (count.n >= maxFiles) return out;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (count.n >= maxFiles) break;
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "generated" || e.name === ".dart_tool") continue;
      walkTexts(full, maxFiles, out, count);
    } else if (/\.(dart|kt|swift|xml|plist|gradle|kts|json|env)$/i.test(e.name)) {
      out.push(readText(full));
      count.n++;
    }
  }
  return out;
}

function scanDirForRiskyPatterns(libDir, flutterRoot) {
  const findings = [];
  const files = [];
  collectFiles(libDir, files, 120);
  for (const f of files) {
    const t = readText(f);
    const rel = relativeSafe(flutterRoot, f);
    if (/https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?/i.test(t)) {
      findings.push(
        finding(STATUS.FAIL, "LOCALHOST_ENDPOINT", "Localhost/emulator HTTP endpoint found in source.", {
          priority: "P0",
          category: "security",
          path: rel,
        })
      );
    }
    if (/kDebugMode\s*\?\s*true|debugShowCheckedModeBanner\s*:\s*true/i.test(t) && /MaterialApp|CupertinoApp/.test(t)) {
      findings.push(
        finding(STATUS.WARN, "DEBUG_BANNER_ON", "debugShowCheckedModeBanner may be forced on.", {
          priority: "P3",
          category: "build",
          path: rel,
        })
      );
    }
    const privMarker = ["BEGIN", "PRIVATE", "KEY"].join(" ");
    if (t.includes(privMarker) || /sk_live_|sk_test_/i.test(t) || /"type"\s*:\s*"service_account"/i.test(t)) {
      findings.push(
        finding(
          STATUS.FAIL,
          "PRIVILEGED_SECRET_IN_CLIENT",
          "Possible privileged credential pattern in client source (value not reported).",
          { priority: "P0", category: "security", path: rel }
        )
      );
    }
  }
  return findings;
}

function collectFiles(dir, out, max) {
  if (out.length >= max) return;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (out.length >= max) break;
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectFiles(full, out, max);
    else if (/\.dart$/i.test(e.name)) out.push(full);
  }
}
