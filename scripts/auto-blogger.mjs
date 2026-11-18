/**
 * WEALTH LAB — Auto Blogger
 * Generates SEO-optimized blog posts from templates and saves them as Markdown files.
 * Reads keyword list, generates article structure, writes content outline.
 * Run with: node scripts/auto-blogger.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output", "content", "seo-articles");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

const KEYWORDS = [
  "freelance rate calculator free",
  "side hustle income calculator",
  "affiliate commission tracker free",
  "savings goal timeline calculator",
  "content idea generator for bloggers",
  "meta description checker free",
  "url slug generator seo",
  "headline analyzer free tool",
  "pricing calculator for services",
  "email subject line tester free",
  "blog post outline generator",
  "social media post formatter free",
];

const TEMPLATES = {
  "calculator": (kw) => `# ${kw.charAt(0).toUpperCase() + kw.slice(1)}

## What This Calculator Does

This free ${kw} helps you [solve specific problem] in seconds. No signup, no email, no ads.

## How to Use It

1. Enter your [input 1]
2. Enter your [input 2]
3. Click calculate
4. See your results instantly

## Why It's Free

Built as part of Wealth Lab's mission to provide zero-cost tools for online builders.

## Related Tools

- [Side Hustle ROI Calculator](/micro-tools/side-hustle-calculator/)
- [Affiliate Commission Calculator](/micro-tools/affiliate-commission-calculator/)

---

*Built by Wealth Lab — Free micro-tools at wealth-lab.github.io*
`,
  "generator": (kw) => `# ${kw.charAt(0).toUpperCase() + kw.slice(1)}

## Generate ${kw} in Seconds

Stop staring at a blank page. This free ${kw} gives you instant ideas you can use today.

## How It Works

1. Enter your topic or niche
2. Click generate
3. Copy and use the results

## Best Practices

- Use the generated ideas as starting points
- Add your own unique perspective
- Publish consistently

---

*Built by Wealth Lab — Free micro-tools at wealth-lab.github.io*
`,
  "analyzer": (kw) => `# ${kw.charAt(0).toUpperCase() + kw.slice(1)}

## Analyze Your ${kw} Before Publishing

Don't guess. Test your ${kw} with this free analyzer and get actionable feedback.

## What Gets Analyzed

- Length and character count
- Keyword placement
- Readability and clarity
- Click-through potential

## Tips for Better Results

- Keep it under 160 characters
- Include your target keyword naturally
- Add a call-to-action word

---

*Built by Wealth Lab — Free micro-tools at wealth-lab.github.io*
`,
};

function getTemplateType(kw) {
  if (kw.includes("calculator")) return "calculator";
  if (kw.includes("generator")) return "generator";
  if (kw.includes("analyzer") || kw.includes("tester") || kw.includes("checker")) return "analyzer";
  return "calculator";
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  let count = 0;
  for (const kw of KEYWORDS) {
    const type = getTemplateType(kw);
    const content = TEMPLATES[type](kw);
    const slug = slugify(kw);
    const fileName = `${slug}.md`;
    const filePath = path.join(OUTPUT, fileName);

    if (fs.existsSync(filePath)) {
      log(`SKIP: ${fileName} already exists`);
      continue;
    }

    const frontmatter = `---
title: "${kw.charAt(0).toUpperCase() + kw.slice(1)}"
description: Free ${kw} tool for online builders. Zero dollars. No signup.
date: ${new Date().toISOString().split("T")[0]}
tags: ${kw.split(" ").join(", ")}, free-tools, zero-dollar
---

`;
    fs.writeFileSync(filePath, frontmatter + content);
    count++;
    log(`Generated: ${fileName}`);
  }

  log(`Auto-blogger complete. Generated ${count} new article files.`);
  log(`Next: Copy these to Medium/Dev.to when API keys are available in .env`);
}

run();
