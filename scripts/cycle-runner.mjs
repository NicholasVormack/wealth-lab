/**
 * WEALTH LAB — Cycle Runner
 * =========================
 * Advances the operating loop one phase per run, with each phase doing real
 * work rather than only rewriting state:
 *
 *   DISCOVERY            inventory the assets that exist right now
 *   BUILD                run asset-builder (publish tools + articles + hub)
 *   DEPLOY               check deploy readiness
 *   AUDIT                run verify-site; a failure blocks the cycle from advancing
 *   READY_FOR_OPERATION  report what the operator still has to do; run auto-pilot
 *                        only when credentials actually exist
 *
 * Run with: node scripts/cycle-runner.mjs
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_PATH = path.join(LAB, "state.json");
const ENDPOINTS_PATH = path.join(LAB, "endpoints.json");
const ENV_PATH = path.join(LAB, ".env");
const HISTORY_PATH = path.join(LAB, "history.log");
const OUTPUT = path.join(LAB, "output");
const TOOLS_DIR = path.join(OUTPUT, "micro-tools");
const ARTICLES_DIR = path.join(OUTPUT, "content/seo-articles");

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function parseEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

/** Credentials the operator has actually filled in (non-empty values only). */
function presentKeys(env) {
  return Object.entries(env)
    .filter(([, v]) => v && v.length > 0)
    .map(([k]) => k);
}

function autoDetectKeys(endpoints, env) {
  let changed = false;
  for (const ep of endpoints) {
    if (ep.status === "READY") continue;
    const keys = (ep.env_key_needed || "").split(/[, ]+/).filter(Boolean);
    if (!keys.length) continue;
    if (keys.every((k) => env[k] && env[k].length > 0)) {
      ep.status = "READY";
      changed = true;
      log(`AUTO-DETECT: ${ep.platform} keys found in .env — flipping to READY`);
    }
  }
  return changed;
}

function runScript(name) {
  try {
    const out = execFileSync(process.execPath, [path.join(LAB, "scripts", name)], {
      cwd: LAB,
      encoding: "utf8",
      timeout: 120000,
      stdio: "pipe",
    });
    return { ok: true, output: out };
  } catch (e) {
    const output = `${e.stdout || ""}${e.stderr || ""}` || e.message;
    return { ok: false, output: String(output) };
  }
}

function countDirs(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((n) => fs.statSync(path.join(dir, n)).isDirectory()).length;
}

function countFiles(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((n) => n.endsWith(ext)).length;
}

function runCycle() {
  const state = readJSON(STATE_PATH);
  const endpoints = readJSON(ENDPOINTS_PATH);
  const env = parseEnv();
  const keys = presentKeys(env);

  log(`=== CYCLE ${state.cycle} — PHASE ${state.phase} ===`);
  log(`Next task: ${state.next_task}`);

  if (autoDetectKeys(endpoints, env)) writeJSON(ENDPOINTS_PATH, endpoints);

  switch (state.phase) {
    case "DISCOVERY": {
      const tools = countDirs(TOOLS_DIR);
      const articles = countFiles(ARTICLES_DIR, ".md");
      log(`Phase: DISCOVERY — inventory: ${tools} micro-tools, ${articles} article drafts, ${keys.length} operator keys`);
      state.phase = "BUILD";
      state.next_task = "Build and publish all assets (asset-builder)";
      break;
    }

    case "BUILD": {
      log("Phase: BUILD — running asset-builder");
      const built = runScript("asset-builder.mjs");
      for (const line of built.output.trim().split("\n")) log(`  ${line}`);
      if (!built.ok) {
        state.next_task = "Fix asset-builder failure, then re-run the cycle";
        log("BUILD FAILED — cycle not advancing");
        break;
      }
      state.phase = "DEPLOY";
      state.next_task = "Check deploy readiness and hosting configuration";
      break;
    }

    case "DEPLOY": {
      log("Phase: DEPLOY — checking hosting readiness");
      const ready = endpoints.filter((e) => e.status === "READY").map((e) => e.platform);
      log(`READY endpoints: ${ready.join(", ") || "none"}`);
      log(`output/.git present: ${fs.existsSync(path.join(OUTPUT, ".git")) ? "yes" : "no — git push not possible yet"}`);
      state.phase = "AUDIT";
      state.next_task = "Verify the built site (links, sitemap, hub coverage)";
      break;
    }

    case "AUDIT": {
      log("Phase: AUDIT — running site verification");
      const verified = runScript("verify-site.mjs");
      for (const line of verified.output.trim().split("\n")) log(`  ${line}`);
      if (!verified.ok) {
        // Stay in AUDIT: a broken site should not count as a completed cycle.
        state.next_task = "Fix the site errors reported by verify-site.mjs, then re-run";
        log("AUDIT FAILED — cycle not advancing");
        break;
      }
      state.cycle += 1;
      state.phase = "READY_FOR_OPERATION";
      state.next_task = "Review operator blockers (keys, hosting) before any distribution";
      break;
    }

    case "READY_FOR_OPERATION": {
      log("Phase: READY_FOR_OPERATION");
      const pending = endpoints.filter((e) => e.status !== "READY");
      log(`Operator keys present: ${keys.length}${keys.length ? ` (${keys.join(", ")})` : ""}`);
      log(`Endpoints still needing setup: ${pending.length}`);

      if (keys.length === 0) {
        log("BLOCKED: no credentials in .env, so no distribution or monetization can run.");
        log("Nothing will be published on its own. Add keys, or publish manually:");
        log("  - Hosting: git init + push output/ to a public repo, enable Pages");
        log("  - Accounts: create them yourself; the lab cannot sign up for you");
        state.next_task = "Add operator keys to .env (or publish manually) to leave READY_FOR_OPERATION";
        break;
      }

      log("Credentials found — handing off to auto-pilot");
      const pilot = runScript("auto-pilot.mjs");
      for (const line of pilot.output.trim().split("\n")) log(`  ${line}`);
      state.phase = "DISCOVERY";
      state.next_task = "Re-validate traffic sources and refine the plan";
      break;
    }

    default: {
      log(`Unknown phase "${state.phase}" — resetting to DISCOVERY`);
      state.phase = "DISCOVERY";
      state.next_task = "Re-validate traffic sources and refine the plan";
    }
  }

  state.memory = `Cycle ${state.cycle}. Phase ${state.phase}. ${countDirs(TOOLS_DIR)} tools, ${countFiles(ARTICLES_DIR, ".md")} articles, ${keys.length} keys.`;
  writeJSON(STATE_PATH, state);
  log(`State saved. Next cycle: ${state.cycle} / ${state.phase}`);
  log(`=== CYCLE RUN COMPLETE ===`);
}

runCycle();
