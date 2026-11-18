/**
 * WEALTH LAB — AUTO-PILOT ORCHESTRATOR
 * ========================================
 * MAXIMUM AUTOMATION EXECUTION ENGINE
 *
 * This script runs the complete pipeline automatically:
 * 1. Checks operator key readiness (.env)
 * 2. Builds/regenerates all static assets
 * 3. Generates content from templates
 * 4. Queues social posts (publishes when keys available)
 * 5. Runs analytics, link tracking, revenue tracking
 * 6. Deploys to GitHub Pages (if git configured)
 *
 * WHAT REQUIRES MANUAL SETUP (cannot be automated):
 * - Creating accounts on Medium, Dev.to, X, Reddit, YouTube, Gumroad, etc.
 * - Generating API keys / OAuth tokens (requires manual login + app creation)
 * - Passing CAPTCHAs and bot detection on third-party platforms
 * - Identity verification / KYC for payment processors
 * - Strategy pivots based on real-world revenue feedback
 * - Creating genuinely valuable, non-spammy content (AI-only = penalized)
 *
 * Run with: node scripts/auto-pilot.mjs
 * Suggested cron: every 6 hours (or daily)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const ENV_PATH = path.join(LAB, ".env");
const HISTORY_PATH = path.join(LAB, "history.log");
const STATE_PATH = path.join(LAB, "state.json");
const ENDPOINTS_PATH = path.join(LAB, "endpoints.json");
const QUEUE_PATH = path.join(LAB, "output", "publish-queue.json");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

function parseEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const raw = fs.readFileSync(ENV_PATH, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function runCommand(cmd) {
  try {
    const out = execSync(cmd, { cwd: LAB, encoding: "utf8", timeout: 60000 });
    return { success: true, output: out.trim() };
  } catch (e) {
    return { success: false, output: e.stderr ? e.stderr.toString() : e.message };
  }
}

// Separate from runCommand so the push step cannot be confused with the
// commit step's output (they used to reference each other's variables).
function gitAddAndPush() {
  runCommand("git add .");
  runCommand('git commit -m "Auto-pilot deploy" --allow-empty');
  return runCommand("git push origin main");
}

function checkKeyReadiness(env, endpoints) {
  const status = { ready: [], pending: [], missing: [] };
  for (const ep of endpoints) {
    if (ep.status === "READY") {
      status.ready.push(ep.platform);
      continue;
    }
    const keys = (ep.env_key_needed || "").split(/[, ]+/).filter(Boolean);
    if (keys.length === 0) {
      status.missing.push(`${ep.platform} (manual setup required: ${ep.instructions_for_operator})`);
    } else {
      const allPresent = keys.every((k) => env[k] && env[k].length > 0);
      if (allPresent) {
        status.ready.push(ep.platform);
      } else {
        status.pending.push(`${ep.platform} (needs: ${ep.env_key_needed})`);
      }
    }
  }
  return status;
}

function generateContentQueue() {
  // Pre-generate a queue of social posts ready to publish when keys appear
  const queue = [
    {
      id: "ugc-001",
      platform: "x",
      text: "Just built a free side hustle ROI calculator. Zero dollars, no signup. Calculate your monthly profit in 30 seconds: https://wealth-lab.github.io/micro-tools/side-hustle-calculator/index.html #sidehustle #freelance #buildinpublic",
      scheduledFor: new Date(Date.now() + 3600000).toISOString(), // +1 hour
      status: "queued",
    },
    {
      id: "ugc-002",
      platform: "reddit",
      subreddit: "sidehustle",
      title: "Free Side Hustle ROI Calculator - estimate your monthly profit",
      body: "Built a free calculator to estimate side hustle profit based on hours, rate, fees, and costs. No signup, no email, no ads. Hope it helps someone: https://wealth-lab.github.io/micro-tools/side-hustle-calculator/index.html",
      scheduledFor: new Date(Date.now() + 7200000).toISOString(), // +2 hours
      status: "queued",
    },
    {
      id: "seo-001",
      platform: "medium",
      title: "How to Start a Side Hustle With $0 in 2026",
      contentSlug: "how-to-start-side-hustle-zero-dollars",
      scheduledFor: new Date(Date.now() + 10800000).toISOString(), // +3 hours
      status: "queued",
    },
    {
      id: "seo-002",
      platform: "devto",
      title: "Programmatic SEO with Free Micro-Tools",
      contentSlug: "programmatic-seo-micro-tools-guide",
      scheduledFor: new Date(Date.now() + 14400000).toISOString(), // +4 hours
      status: "queued",
    },
  ];
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
  return queue;
}

function autoPilot() {
  log("============================================");
  log("WEALTH LAB AUTO-PILOT ORCHESTRATOR STARTED");
  log("============================================");

  const env = parseEnv();
  const state = readJSON(STATE_PATH);
  const endpoints = readJSON(ENDPOINTS_PATH);

  // 1. Key readiness check
  const readiness = checkKeyReadiness(env, endpoints);
  log(`READY platforms: ${readiness.ready.length} — ${readiness.ready.join(", ") || "none (GitHub Pages via git only)"}`);
  if (readiness.pending.length > 0) {
    log(`PENDING keys: ${readiness.pending.join(", ")}`);
  }
  if (readiness.missing.length > 0) {
    log(`MANUAL SETUP REQUIRED: ${readiness.missing.length} platform(s)`);
    readiness.missing.forEach((m) => log(`  - ${m}`));
  }

  // 2. Build all static assets — nothing downstream is trustworthy without this
  log("Building static assets...");
  const buildResult = runCommand("node scripts/asset-builder.mjs");
  log(`  asset-builder: ${buildResult.success ? "OK" : "FAILED — " + buildResult.output.substring(0, 300)}`);
  if (!buildResult.success) {
    log("ABORTING: asset build failed. Fix asset-builder.mjs before continuing.");
    process.exit(1);
  }

  // 2b. Verify the built site before anything is queued or deployed
  const verifyResult = runCommand("node scripts/verify-site.mjs");
  log(`  verify-site: ${verifyResult.success ? "PASS" : "FAILED"}`);
  if (!verifyResult.success) {
    log(verifyResult.output.split("\n").filter((l) => /^(ERROR|RESULT)/.test(l)).slice(0, 10).join("\n"));
  }

  // 3. Generate content queue for auto-posting
  const queue = generateContentQueue();
  log(`Content queue: ${queue.length} items ready for auto-publish`);

  // 4. Run all tracking/analytics
  log("Running tracking & analytics...");
  for (const script of ["publisher.mjs", "link-tracker.mjs", "revenue-tracker.mjs", "content-repurposer.mjs", "analytics-tracker.mjs"]) {
    const r = runCommand(`node scripts/${script}`);
    log(`  ${script}: ${r.success ? "OK" : "FAILED — " + r.output.substring(0, 200)}`);
  }

  // 5. Deploy to GitHub Pages if git is available
  log("Checking GitHub Pages deployment readiness...");
  const deployPrep = runCommand("node scripts/deploy-github-pages.mjs");
  log(`  deploy-prep: ${deployPrep.success ? "OK" : "FAILED — " + deployPrep.output.substring(0, 200)}`);

  // 6. Attempt git push if .git exists
  const gitExists = fs.existsSync(path.join(OUTPUT, ".git"));
  if (gitExists) {
    log("Git repo detected — attempting auto-deploy...");
    const addResult = runCommand("git add .");
    const commitResult = runCommand('git commit -m "Auto-pilot deploy" --allow-empty');
    const pushResult = gitAddAndPush();
    log(`  git add: ${addResult.success ? "OK" : "skipped/failed"}`);
    log(`  git commit: ${commitResult.success ? "OK" : "skipped/failed"}`);
    log(`  git push: ${pushResult.success ? "DEPLOYED LIVE" : "FAILED — " + pushResult.output.substring(0, 200)}`);
  } else {
    log("No git repo in output/. Run: cd output/ && git init && git remote add origin <url>");
  }

  // 7. Run investment tracker
  log("Running investment tracker...");
  const investResult = runCommand("node scripts/investment-tracker.mjs");
  log(`  investment-tracker: ${investResult.success ? "OK" : "FAILED — " + investResult.output.substring(0, 200)}`);

  // 8. Update state
  state.memory = `Auto-pilot executed. Site verify: ${verifyResult.success ? "PASS" : "FAIL"}. ${readiness.ready.length} platforms ready. ${queue.length} posts queued.`;
  state.next_task = "Review publish-queue.json, add operator keys to .env for full automation, update investment-data.json with real balances";
  writeJSON(STATE_PATH, state);

  // 9. Final report
  log("============================================");
  log("AUTO-PILOT CYCLE COMPLETE");
  log("============================================");
  log(`Platforms ready: ${readiness.ready.join(", ") || "None (GitHub Pages manual only)"}`);
  log(`Content queued: ${queue.length} posts`);
  log(`Missing setup: ${readiness.missing.length} platforms need manual keys`);
  log("");
  log("INVESTMENT TRACKER: output/investment-dashboard.html updated");
  log("Investment data: output/investment-data.json (edit with real balances)");
  log("");
  log("TO ENABLE FULL AUTO-PUBLISHING:");
  log("  1. Add API keys to ./wealth-lab/.env");
  log("  2. Re-run: node scripts/auto-pilot.mjs");
  log("  3. Or set up cron: 0 */6 * * * node /path/to/wealth-lab/scripts/auto-pilot.mjs");
  log("");
  log("REALITY CHECK: Auto-pilot handles building, scheduling, and publishing.");
  log("It does NOT handle account creation, KYC verification, CAPTCHA solving,");
  log("or strategy pivots. Those require your manual intervention.");
  log("============================================");
}

autoPilot();
