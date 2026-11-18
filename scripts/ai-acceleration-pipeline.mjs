/**
 * WEALTH LAB — AI Acceleration Pipeline
 * Compresses content creation timeline using AI + human oversight.
 * Output: structured prompts and workflow steps for maximum speed.
 * Run with: node scripts/ai-acceleration-pipeline.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

const pipeline = {
  name: "AI Acceleration Pipeline",
  principle: "AI compresses execution. Human judgment adds value. Never publish AI-only content.",
  steps: [
    {
      step: 1,
      name: "Idea Generation",
      ai_prompt: "Give me 20 long-tail keyword ideas for [NICHE]. Each must be a specific question someone would type into Google. Focus on buyer intent and problem-aware searches.",
      human_action: "Pick the top 5 ideas. Add your own perspective or experience to each.",
      time_saved: "30 min → 2 min"
    },
    {
      step: 2,
      name: "Outline Creation",
      ai_prompt: "Create a detailed outline for an article about [TOPIC]. Include H1, H2, H3 sections. Add FAQ section at end. Target word count 1,500-2,000. Make it practical and actionable, not generic.",
      human_action: "Reorder sections. Add personal examples. Remove anything generic.",
      time_saved: "45 min → 5 min"
    },
    {
      step: 3,
      name: "First Draft",
      ai_prompt: "Write a 1,500-word article based on this outline: [OUTLINE]. Write in a helpful, conversational tone. Use short paragraphs. Include specific examples. Avoid generic AI phrases like 'in today's digital landscape' or 'it's important to note'.",
      human_action: "Rewrite the intro and conclusion. Add your personal story. Insert your micro-tool links and affiliate links naturally.",
      time_saved: "3 hours → 45 min"
    },
    {
      step: 4,
      name: "SEO Optimization",
      ai_prompt: "Review this article for SEO: [ARTICLE]. Suggest: 1) Better title (under 60 chars), 2) Meta description (under 160 chars), 3) 5 relevant keywords to include naturally, 4) Internal linking opportunities.",
      human_action: "Apply changes. Add your meta tags. Link to your other articles.",
      time_saved: "45 min → 10 min"
    },
    {
      step: 5,
      name: "Social Distribution",
      ai_prompt: "Turn this article into: 1) X thread (5 tweets), 2) LinkedIn post, 3) Pinterest pin description, 4) TikTok script (60 seconds). Keep each platform's style in mind.",
      human_action: "Record the TikTok/Reel. Post manually. Engage with comments.",
      time_saved: "2 hours → 20 min"
    },
    {
      step: 6,
      name: "Email Sequence",
      ai_prompt: "Write a 5-email welcome sequence for new subscribers interested in [NICHE]. Each email under 300 words. Include one soft pitch in email 4. End each with a question to encourage replies.",
      human_action: "Personalize with your voice. Add your actual product/affiliate links. Load into Mailchimp/MailerLite.",
      time_saved: "2 hours → 20 min"
    }
  ],
  total_time_saved: "~10 hours per week per article",
  key_rule: "AI writes the draft. Human adds the soul. Publish only when it sounds like you."
};

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  let md = `# AI Acceleration Pipeline\n\n`;
  md += `**Principle:** ${pipeline.principle}\n\n`;
  md += `**Total time saved:** ${pipeline.total_time_saved}\n\n`;
  md += `**Key rule:** ${pipeline.key_rule}\n\n---\n\n`;

  pipeline.steps.forEach((s) => {
    md += `## Step ${s.step}: ${s.name}\n\n`;
    md += `**AI Prompt:**\n\`\`\`\n${s.ai_prompt}\n\`\`\`\n\n`;
    md += `**Human Action:** ${s.human_action}\n\n`;
    md += `**Time Saved:** ${s.time_saved}\n\n---\n\n`;
  });

  md += `## Daily Workflow (Compressed)\n\n`;
  md += `| Task | Without AI | With AI Pipeline |\n`;
  md += `|------|------------|------------------|\n`;
  md += `| Idea + Outline | 75 min | 7 min |\n`;
  md += `| Write Draft | 3 hours | 45 min |\n`;
  md += `| SEO + Optimize | 45 min | 10 min |\n`;
  md += `| Social Distribution | 2 hours | 20 min |\n`;
  md += `| Email Sequence | 2 hours | 20 min |\n`;
  md += `| **Total per article** | **~8.5 hours** | **~1.5 hours** |\n\n`;
  md += `**You can now publish 3-5x more content with the same time investment.**\n\n---\n\n`;
  md += `## AI Tools to Use (Free Tiers)\n\n`;
  md += `| Task | Tool | Cost |\n`;
  md += `|------|------|------|\n`;
  md += `| Writing / Drafting | Claude, ChatGPT | Free tier |\n`;
  md += `| SEO Research | Google Keyword Planner, AnswerThePublic | Free |\n`;
  md += `| Video Editing | CapCut | Free |\n`;
  md += `| Graphics | Canva | Free tier |\n`;
  md += `| Transcription | Whisper, built-in phone tools | Free |\n`;

  fs.writeFileSync(path.join(OUTPUT, "ai-acceleration-pipeline.md"), md);
  log(`AI Acceleration Pipeline written to output/ai-acceleration-pipeline.md`);
  log(`Steps: ${pipeline.steps.length} | Time saved: ${pipeline.total_time_saved}`);
  log(`=== AI ACCELERATION PIPELINE COMPLETE ===\n`);
}

run();
