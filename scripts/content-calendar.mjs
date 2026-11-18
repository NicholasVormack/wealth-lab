/**
 * WEALTH LAB — Content Calendar Generator
 * Generates a 90-day publishing schedule for micro-tools, SEO articles, and social posts.
 * Run with: node scripts/content-calendar.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(date) {
  return date.toISOString().split("T")[0];
}

const TOOLS = [
  "side-hustle-calculator",
  "affiliate-commission-calculator",
  "freelance-rate-calculator",
  "savings-goal-calculator",
  "content-idea-generator",
];
const ARTICLES = [
  "how-to-start-side-hustle-zero-dollars",
  "free-affiliate-programs-instant-approval-2026",
  "programmatic-seo-micro-tools-guide",
  "medium-devto-affiliate-strategy",
  "github-pages-free-hosting-guide",
];
const PLATFORMS = ["Medium", "Dev.to", "Reddit", "X (Twitter)"];

function generate() {
  const start = new Date();
  const calendar = [];

  log("=== CONTENT CALENDAR GENERATED ===");

  for (let day = 0; day < 90; day++) {
    const date = addDays(start, day);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

    // Monday/Wednesday/Friday: Publish article
    // Tuesday/Thursday: Promote tools on social
    // Saturday: Write new content
    // Sunday: Rest / analytics review

    let tasks = [];

    if (dayOfWeek === "Mon" || dayOfWeek === "Wed" || dayOfWeek === "Fri") {
      const article = ARTICLES[day % ARTICLES.length];
      tasks.push(`Publish article: ${article} to Medium + Dev.to`);
    }
    if (dayOfWeek === "Tue" || dayOfWeek === "Thu") {
      const tool = TOOLS[day % TOOLS.length];
      tasks.push(`Promote tool: ${tool} on Reddit + X`);
    }
    if (dayOfWeek === "Sat") {
      tasks.push("Write new SEO article or build new micro-tool");
    }
    if (dayOfWeek === "Sun") {
      tasks.push("Review analytics, update state.json, plan next week");
    }

    calendar.push({ date: fmt(date), day: dayOfWeek, tasks });
  }

  // Output markdown calendar
  let md = "# 90-Day Content Calendar\n\n";
  md += "| Date | Day | Tasks |\n|------|-----|-------|\n";
  for (const entry of calendar) {
    md += `| ${entry.date} | ${entry.day} | ${entry.tasks.join("; ")} |\n`;
  }

  const outPath = path.join(LAB, "output", "content-calendar.md");
  fs.writeFileSync(outPath, md);
  log(`Wrote 90-day calendar to ${outPath}`);
  log(`Total tool promotions: ${Math.floor(90 / 7) * 2 + (90 % 7 >= 2 ? 1 : 0) + (90 % 7 >= 4 ? 1 : 0)}`);
  log(`Total article publishes: ${Math.floor(90 / 7) * 3 + Math.min(90 % 7, 3)}`);
  log("=== CONTENT CALENDAR COMPLETE ===");
}

generate();
