/**
 * Shared site configuration for the Wealth Lab builders.
 * Resolves the canonical site URL so generated sitemaps, canonicals and
 * robots.txt are correct on GitHub Pages without hand-editing a constant.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

export const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const OUTPUT = path.join(LAB, "output");

const DEFAULT_SITE_URL = "https://wealth-lab.github.io";
const ENV_PATH = path.join(LAB, ".env");
const STATE_PATH = path.join(LAB, "state.json");

export function readEnv() {
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

/**
 * Derive the Pages URL from the git remote:
 *   git@github.com:owner/repo.git  -> https://owner.github.io/repo
 *   https://github.com/owner/owner.github.io -> https://owner.github.io
 */
function siteUrlFromRemote() {
  try {
    const remote = execFileSync("git", ["config", "--get", "remote.origin.url"], {
      cwd: LAB,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!remote) return null;
    const m = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (!m) return null;
    const [, owner, repo] = m;
    const host = `https://${owner.toLowerCase()}.github.io`;
    return repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? host : `${host}/${repo}`;
  } catch {
    return null;
  }
}

function siteUrlFromState() {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return state.site_url ? String(state.site_url) : null;
  } catch {
    return null;
  }
}

/**
 * Precedence: explicit SITE_URL in .env (custom domain) > the git remote
 * (always right for GitHub Pages) > state.json > a safe default.
 */
export function resolveSiteUrl() {
  const env = readEnv();
  const url =
    (env.SITE_URL && env.SITE_URL.trim()) ||
    siteUrlFromRemote() ||
    siteUrlFromState() ||
    DEFAULT_SITE_URL;
  return String(url).replace(/\/+$/, "");
}
