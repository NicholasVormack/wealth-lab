/**
 * WEALTH LAB — Content Repurposer
 * Takes one SEO article and generates multiple social media posts for different platforms.
 * Run with: node scripts/content-repurposer.mjs
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

const ARTICLE = {
  title: "How to Start a Side Hustle With $0 in 2026",
  keyPoints: [
    "You don't need money to make money online — you need time and free tools",
    "Build one micro-tool (calculator, generator, or planner) and host it on GitHub Pages",
    "Join instant-approval affiliate programs: Systeme.io (40% recurring), ClickBank, ShareASale",
    "Publish SEO articles on Medium and Dev.to with links back to your tool",
    "Distribute daily on Reddit, X, Pinterest, and TikTok",
    "First $100 typically comes in weeks 4–8, not day 1",
  ],
  toolUrl: "https://wealth-lab.github.io/micro-tools/side-hustle-calculator/",
  articleUrl: "https://wealth-lab.github.io/",
};

function run() {
  log("=== CONTENT REPURPOSER RUN ===");

  // X (Twitter) thread
  log("Generating X (Twitter) thread...");
  const xThread = [
    `🧵 How to start a side hustle with $0 in 2026:\n\n1/ You don't need money. You need time + free tools.\n\n2/ Build ONE micro-tool (calculator, generator, planner). Host it free on GitHub Pages.\n\n3/ Join instant-approval affiliates: Systeme.io (40% recurring), ClickBank, ShareASale.\n\n4/ Write SEO articles on Medium + Dev.to. Link back to your tool.\n\n5/ Distribute daily: Reddit, X, Pinterest, TikTok.\n\n6/ First $100 comes in weeks 4-8. Not day 1.\n\nFree calculator: ${ARTICLE.toolUrl}`,
  ];
  log(`X thread: ${xThread[0].substring(0, 80)}...`);

  // LinkedIn post
  const linkedInPost = `
${ARTICLE.title}

The biggest myth about making money online? That you need capital to start.

You don't. You need consistency and free tools.

Here's the exact $0 stack I recommend:

🛠️ GitHub Pages — host your micro-tool for free
📝 Medium + Dev.to — publish SEO articles for free
🎨 Canva free — create graphics and pins
📊 Systeme.io — 40% recurring affiliate, instant approval
🔗 Linktree free — one link in bio for everything

Start with one tool. Write one article per week. Post daily on social.

The first $100 takes 4-8 weeks. After that, it compounds.

Free side hustle calculator: ${ARTICLE.toolUrl}

#sidehustle #freelance #make money online #buildinpublic #zerodollar
`;
  log(`LinkedIn post: ${linkedInPost.substring(0, 80)}...`);

  // Pinterest pin description
  const pinterestDesc = `Free side hustle ROI calculator — estimate your monthly profit in 30 seconds. No signup, no email, no ads. Built with free tools. Perfect for freelancers, side hustlers, and entrepreneurs. Get it here: ${ARTICLE.toolUrl} #sidehustle #freelance #moneymaking #freetools #entrepreneur`;
  log(`Pinterest description: ${pinterestDesc.substring(0, 80)}...`);

  // TikTok script
  const tiktokScript = `
HOOK (0-3s): "Stop trying to make money without a plan."

BODY (3-45s): "Here's the $0 side hustle stack that actually works:
- Free calculator (link in bio)
- Medium + Dev.to for articles
- Systeme.io for 40% recurring affiliate
- GitHub Pages for hosting

All free. All today."

CTA (last 3s): "Free calculator — link in bio. Start today."
`;
  log(`TikTok script: ${tiktokScript.substring(0, 80)}...`);

  // Reddit post
  const redditPost = {
    title: "Free Side Hustle ROI Calculator - estimate your monthly profit in 30 seconds",
    body: `I built a free calculator to estimate side hustle profit based on hours worked, hourly rate, platform fees, and tool costs.

No signup. No email. No ads. Just a simple tool to help you see if your side hustle idea is worth pursuing.

Here's the $0 stack I recommend:
1. GitHub Pages - free hosting for your tool
2. Medium + Dev.to - free SEO article publishing
3. Systeme.io - 40% recurring affiliate, instant approval
4. Linktree - free link in bio

Get the calculator: ${ARTICLE.toolUrl}

Hope it helps someone. Happy to answer questions in the comments.`,
  };
  log(`Reddit post: ${redditPost.title.substring(0, 60)}...`);

  // Output summary
  log("");
  log("=== REPURPOSING COMPLETE ===");
  log("Generated: X thread, LinkedIn post, Pinterest description, TikTok script, Reddit post");
  log("All from one article: " + ARTICLE.title);
  log("Copy and paste these into your social platforms when you have API keys in .env");
}

run();
