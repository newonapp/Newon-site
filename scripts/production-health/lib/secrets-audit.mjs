import fs from "fs";
import path from "path";
import { REPO_ROOT, SITE_SCOPE } from "../config.mjs";
import { finding, STATUS } from "./status.mjs";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "_publish",
  "upload-pack",
  ".dart_tool",
  "build",
  "dist",
  "404-human",
  "production-health", // checker source contains pattern strings — not real secrets
]);

/**
 * Repo-wide secrets / privileged credential scan (website + optional flutter roots).
 * Never includes secret values in findings.
 */
export function auditSecrets(extraRoots = []) {
  const findings = [];
  const roots = [REPO_ROOT, ...extraRoots.filter(Boolean)];

  for (const root of roots) {
    scanRoot(root, findings, root === REPO_ROOT ? "website" : "flutter");
  }

  // HQ rules: hardcoded admin UID is a known pattern — report location only
  const rules = path.join(REPO_ROOT, "firestore.rules");
  if (fs.existsSync(rules)) {
    const text = fs.readFileSync(rules, "utf8");
    if (/ADMIN_UID\s*=\s*['"]/.test(text) || /request\.auth\.uid\s*==\s*['"][a-zA-Z0-9]{20,}['"]/.test(text)) {
      findings.push(
        finding(
          STATUS.WARN,
          "HQ_HARDCODED_ADMIN_UID",
          "HQ firestore.rules appears to hardcode an admin UID. Consumer apps are unaffected; rotate/review if UID leaked outside intended admins. Value not reported.",
          {
            priority: "P2",
            category: "security",
            path: "firestore.rules",
            note: SITE_SCOPE.hqFirebase.appliesTo,
          }
        )
      );
    }
    if (/allow\s+(read|write)\s*:\s*if\s+true/i.test(text)) {
      findings.push(
        finding(STATUS.FAIL, "HQ_RULES_OPEN", "firestore.rules contains allow if true (test-mode remnant risk).", {
          priority: "P0",
          category: "security",
          path: "firestore.rules",
        })
      );
    }
  }

  // Tracked .env (should be gitignored)
  const envFiles = ["/.env", "/.env.local", "/.env.production"];
  for (const rel of envFiles) {
    const p = path.join(REPO_ROOT, rel.slice(1));
    if (fs.existsSync(p)) {
      findings.push(
        finding(STATUS.FAIL, "ENV_FILE_PRESENT", "Environment file present on disk — confirm it is not git-tracked.", {
          priority: "P0",
          category: "security",
          path: rel.slice(1),
          manual: true,
        })
      );
    }
  }

  if (!findings.some((f) => f.category === "security" && f.status === STATUS.FAIL)) {
    const hasWarn = findings.some((f) => f.category === "security" && f.status === STATUS.WARN);
    if (!hasWarn) {
      findings.push(
        finding(
          STATUS.PASS,
          "SECRETS_SCAN_CLEAN",
          "No privileged credential patterns detected in scanned website files (Firebase client config not treated as secret leak).",
          { category: "security" }
        )
      );
    }
  }

  return findings;
}

function scanRoot(root, findings, label) {
  const files = [];
  walk(root, files, 0, 8);
  for (const f of files) {
    const rel = path.relative(REPO_ROOT, f);
    const base = path.basename(f).toLowerCase();
    if (base.endsWith(".pem") || base.endsWith(".p12") || base.includes("serviceaccount")) {
      findings.push(
        finding(STATUS.FAIL, "SENSITIVE_FILENAME", `Sensitive-looking file name under ${label} tree.`, {
          priority: "P0",
          category: "security",
          path: sanitizePath(rel),
        })
      );
      continue;
    }
    if (!/\.(js|mjs|ts|dart|json|html|md|env|plist|gradle|kts|xml|yml|yaml|sh|rules)$/i.test(f)) continue;
    // Skip huge locale dumps for pattern scan except quick name checks
    let text = "";
    try {
      const st = fs.statSync(f);
      if (st.size > 1_500_000) continue;
      text = fs.readFileSync(f, "utf8");
    } catch {
      continue;
    }

    const beginPriv = new RegExp("BEGIN (RSA |EC |OPENSSH )?" + "PRIVATE KEY");
    if (beginPriv.test(text)) {
      findings.push(
        finding(STATUS.FAIL, "PRIVATE_KEY_MATERIAL", "Private key material detected (content not reported).", {
          priority: "P0",
          category: "security",
          path: sanitizePath(rel),
        })
      );
    }
    if (/"type"\s*:\s*"service_account"/i.test(text) && /private_key/i.test(text)) {
      findings.push(
        finding(STATUS.FAIL, "SERVICE_ACCOUNT_JSON", "Firebase/Google service account JSON pattern detected.", {
          priority: "P0",
          category: "security",
          path: sanitizePath(rel),
        })
      );
    }
    if (/\b(sk_live_|sk_test_|whsec_|xox[baprs]-)[A-Za-z0-9_-]{8,}/.test(text)) {
      findings.push(
        finding(STATUS.FAIL, "TOKEN_PATTERN", "Privileged token pattern detected (content not reported).", {
          priority: "P0",
          category: "security",
          path: sanitizePath(rel),
        })
      );
    }
    // Stripe/OpenAI-style — avoid false positive on short hashes
    if (/\b(OPENAI_API_KEY|ANTHROPIC_API_KEY)\s*[=:]\s*['"]?[A-Za-z0-9_-]{20,}/.test(text)) {
      findings.push(
        finding(STATUS.FAIL, "AI_API_KEY_ASSIGNMENT", "AI API key assignment pattern in source.", {
          priority: "P0",
          category: "security",
          path: sanitizePath(rel),
        })
      );
    }
  }
}

function walk(dir, out, depth, maxDepth) {
  if (depth > maxDepth || out.length > 4000) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".env" && e.name !== ".env.local") continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out, depth + 1, maxDepth);
    else out.push(full);
  }
}

function sanitizePath(p) {
  // Never include query strings or home directory expansions that might leak
  return String(p).replace(/\\/g, "/").slice(0, 240);
}
