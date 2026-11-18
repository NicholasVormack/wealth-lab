/**
 * WEALTH LAB — Endpoint Publisher
 * Reads .env for operator keys. If a platform is READY, publishes queued assets.
 * If not READY, logs instructions for the operator.
 * Run with: node scripts/publisher.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = path.join(LAB, ".env");
const ENDPOINTS_PATH = path.join(LAB, "endpoints.json");
const HISTORY_PATH = path.join(LAB, "history.log");

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

function main() {
  const env = parseEnv();
  const endpoints = JSON.parse(fs.readFileSync(ENDPOINTS_PATH, "utf8"));

  log("=== PUBLISHER RUN ===");

  // There are no per-platform HTTP adapters in this repo, so having a key in
  // .env does NOT mean anything gets published. Say so instead of implying
  // that a credential equals an integration.
  let credentialled = 0;

  for (const ep of endpoints) {
    if (ep.status === "READY") {
      credentialled++;
      if (ep.platform === "GitHub Pages") {
        log(`READY: GitHub Pages — static hosting. Publish with git push (see deploy-github-pages.mjs).`);
      } else {
        log(`CREDENTIALED (no adapter): ${ep.platform} — key present, but no publisher is implemented for this platform.`);
      }
    } else {
      log(`PENDING: ${ep.platform} — needs operator key: ${ep.env_key_needed || "manual setup"}`);
      log(`  -> ${ep.instructions_for_operator}`);
    }
  }

  log(`${credentialled}/${endpoints.length} endpoints have credentials.`);
  log("GitHub Pages is READY — deploy by pushing output/ to a public repo and enabling Pages.");
  if (credentialled <= 1) {
    log("No publishing credentials found. Keys in .env only flip endpoint status;");
    log("distribution still happens manually or via social-poster.mjs once keys exist.");
  }
  log("=== PUBLISHER RUN COMPLETE ===");
}

main();
