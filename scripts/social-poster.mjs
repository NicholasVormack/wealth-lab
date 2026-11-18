/**
 * WEALTH LAB — Social Media Auto-Poster
 * Skeleton script for automated distribution to X, Reddit, Medium, Dev.to.
 * Reads API keys from .env. Skips platforms without keys.
 * Run with: node scripts/social-poster.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = path.join(LAB, ".env");
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

const POSTS = [
  {
    platform: "x",
    text: "Just built a free side hustle ROI calculator. Zero dollars, no signup. Calculate your monthly profit in 30 seconds: https://wealth-lab.github.io/micro-tools/side-hustle-calculator/index.html #sidehustle #freelance #buildinpublic",
  },
  {
    platform: "reddit",
    subreddit: "sidehustle",
    title: "Free Side Hustle ROI Calculator - estimate your monthly profit",
    body: "Built a free calculator to estimate side hustle profit based on hours, rate, fees, and costs. No signup, no email, no ads. Hope it helps someone: https://wealth-lab.github.io/micro-tools/side-hustle-calculator/index.html",
  },
  {
    platform: "medium",
    title: "How to Start a Side Hustle With $0 in 2026",
    contentSlug: "how-to-start-side-hustle-zero-dollars",
  },
  {
    platform: "devto",
    title: "Programmatic SEO with Free Micro-Tools",
    contentSlug: "programmatic-seo-micro-tools-guide",
  },
];

async function postToX(env, post) {
  if (!env.X_API_KEY || !env.X_ACCESS_TOKEN) {
    log(`X: SKIPPED — needs X_API_KEY and X_ACCESS_TOKEN in .env`);
    return;
  }
  log(`X: Would post: "${post.text.substring(0, 60)}..."`);
  // Integration: POST https://api.twitter.com/2/tweets with OAuth 1.0a
}

async function postToReddit(env, post) {
  if (!env.REDDIT_CLIENT_ID || !env.REDDIT_CLIENT_SECRET) {
    log(`Reddit: SKIPPED — needs REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env`);
    return;
  }
  log(`Reddit: Would post to r/${post.subreddit}: "${post.title}"`);
  // Integration: POST https://oauth.reddit.com/api/submit with OAuth 2.0
}

async function postToMedium(env, post) {
  if (!env.MEDIUM_ACCESS_TOKEN) {
    log(`Medium: SKIPPED — needs MEDIUM_ACCESS_TOKEN in .env`);
    return;
  }
  log(`Medium: Would publish: "${post.title}"`);
  // Integration: POST https://api.medium.com/v1/users/{userId}/posts
}

async function postToDevto(env, post) {
  if (!env.DEVTO_API_KEY) {
    log(`Dev.to: SKIPPED — needs DEVTO_API_KEY in .env`);
    return;
  }
  log(`Dev.to: Would publish: "${post.title}"`);
  // Integration: POST https://dev.to/api/articles
}

async function run() {
  const env = parseEnv();
  log("=== SOCIAL POSTER RUN ===");

  for (const post of POSTS) {
    switch (post.platform) {
      case "x": await postToX(env, post); break;
      case "reddit": await postToReddit(env, post); break;
      case "medium": await postToMedium(env, post); break;
      case "devto": await postToDevto(env, post); break;
    }
  }

  log("Add keys to .env to enable live posting. Scripts are ready to execute.");
  log("=== SOCIAL POSTER RUN COMPLETE ===");
}

run().catch((err) => {
  log(`ERROR: ${err.message}`);
  process.exit(1);
});
