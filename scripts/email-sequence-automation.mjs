/**
 * WEALTH LAB — Email Sequence Automation
 * Generates automated email sequence files ready for import into Mailchimp, MailerLite, or ConvertKit.
 * Creates CSV import files and HTML email templates.
 * Run with: node scripts/email-sequence-automation.mjs
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

const SEQUENCE_NAME = "Welcome Series — $0 Side Hustle";
const FROM_NAME = "Wealth Lab";
const FROM_EMAIL = "hello@wealthlab.example.com";

const emails = [
  {
    day: 0,
    subject: "Your free tools are here 🎁",
    preview: "Start with the side hustle calculator",
    body: `<h2>Welcome to Wealth Lab</h2><p>Here are the free tools you asked for:</p><ul><li><a href="https://wealth-lab.github.io/micro-tools/side-hustle-calculator/">Side Hustle ROI Calculator</a></li><li><a href="https://wealth-lab.github.io/micro-tools/affiliate-commission-calculator/">Affiliate Commission Calculator</a></li><li><a href="https://wealth-lab.github.io/micro-tools/freelance-rate-calculator/">Freelance Rate Calculator</a></li></ul><p>No signup. No email required. Just use them.</p><p>Tomorrow I'll show you how to promote these tools and earn your first affiliate commission.</p>`,
  },
  {
    day: 1,
    subject: "How to make your first $100 online",
    preview: "The exact $0 stack I recommend",
    body: `<h2>Your First $100</h2><p>You don't need money to make money online. You need time and free tools.</p><p>Here's the exact stack:</p><ul><li><strong>GitHub Pages</strong> — host your micro-tool for free</li><li><strong>Medium + Dev.to</strong> — publish SEO articles for free</li><li><strong>Systeme.io</strong> — 40% recurring affiliate, instant approval</li></ul><p>Start with one tool. Write one article per week. Post daily on social.</p><p>The first $100 takes 4–8 weeks. After that, it compounds.</p>`,
  },
  {
    day: 3,
    subject: "My first $100 online (honest breakdown)",
    preview: "It took 6 weeks. Here's what I did.",
    body: `<h2>My Honest Breakdown</h2><p>I made $0 for the first 6 weeks. I almost quit.</p><p>What changed? I stopped looking for shortcuts and started building:</p><ol><li>One micro-tool</li><li>One article per week</li><li>One social post per day</li></ol><p>Week 7: First $100 from affiliate commissions.</p><p>The tools are all free. The articles took 30 minutes each. The social posts took 10 minutes each.</p><p>You can do the same. Start today.</p>`,
  },
  {
    day: 5,
    subject: "Something I built for you",
    preview: "Free template for your side hustle",
    body: `<h2>Free Template</h2><p>After sharing free tools for 5 days, I want to give you something more.</p><p>I built a [digital product — template, checklist, or guide] that helps you [specific benefit].</p><p>Get it here: [your Gumroad/Ko-fi link]</p><p>No pressure — the free tools are still free. This is just for anyone who wants the next level.</p>`,
  },
  {
    day: 7,
    subject: "Quick question",
    preview: "How's it going?",
    body: `<h2>Quick Question</h2><p>It's been a week since you joined. I'd love to know: what's working for you, and what's not?</p><p>Reply to this email. I read every single response.</p><p>No sales pitch this time. Just curious.</p>`,
  },
];

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });
  if (!fs.existsSync(path.join(OUTPUT, "email-sequences"))) fs.mkdirSync(path.join(OUTPUT, "email-sequences"), { recursive: true });

  // Generate CSV import file
  let csv = "Day,Subject,Preview,From Name,From Email,Body HTML\n";
  emails.forEach((e) => {
    const bodyEscaped = e.body.replace(/"/g, '""');
    csv += `${e.day},"${e.subject}","${e.preview}","${FROM_NAME}","${FROM_EMAIL}","${bodyEscaped}"\n`;
  });
  fs.writeFileSync(path.join(OUTPUT, "email-sequence-import.csv"), csv);
  log(`Email sequence CSV written to output/email-sequence-import.csv (${emails.length} emails)`);

  // Generate HTML version of each email
  emails.forEach((e) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${e.subject}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  h2 { color: #1e293b; font-size: 24px; margin-bottom: 16px; }
  p { color: #475569; margin-bottom: 16px; font-size: 16px; }
  a { color: #22d3ee; text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
  ul, ol { margin-bottom: 20px; padding-left: 24px; }
  li { margin-bottom: 8px; color: #475569; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  .unsubscribe { color: #94a3b8; font-size: 11px; }
</style>
</head>
<body>
${e.body}
<div class="footer">
  <p>You're receiving this because you signed up for Wealth Lab free tools.</p>
  <p><a href="#" class="unsubscribe">Unsubscribe</a> | <a href="#">Update preferences</a></p>
  <p>&copy; 2026 Wealth Lab. All rights reserved.</p>
</div>
</body>
</html>`;
    const fileName = `email-day-${String(e.day).padStart(2, "0")}-${e.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    fs.writeFileSync(path.join(OUTPUT, "email-sequences", fileName), html);
  });
  log(`Email sequence HTML files written to output/email-sequences/ (${emails.length} files)`);

  // Generate import instructions
  const instructions = `# Email Sequence Import Instructions

## Platform: Mailchimp (Free Tier)

1. Go to Mailchimp → Audience → All contacts
2. Click "Import contacts" → "Upload file"
3. Upload: \`output/email-sequence-import.csv\`
4. Map fields: Day, Subject, Preview, From Name, From Email, Body HTML
5. Create a new campaign → Email → Regular
6. Select "Automated" → "Welcome email"
7. Set trigger: When someone joins your audience
8. Add each day's email as a step in the automation

## Platform: MailerLite (Free Tier)

1. Go to MailerLite → Automation → Create new automation
2. Select "When subscriber joins a group"
3. Add email steps matching the CSV days (0, 1, 3, 5, 7)
4. Copy subject lines and body HTML from the generated files
5. Set delays: Day 0 (immediate), Day 1 (1 day), Day 3 (3 days), Day 5 (5 days), Day 7 (7 days)

## Platform: ConvertKit (Free Tier)

1. Go to ConvertKit → Automations → Rules → Add rule
2. Trigger: Subscriber is added to a form
3. Action: Add to sequence → Create new sequence
4. Add emails matching the CSV schedule
5. Set timing: immediate, +1 day, +3 days, +5 days, +7 days

## Files Generated

- \`output/email-sequence-import.csv\` — All emails in CSV format for bulk import
- \`output/email-sequences/\` — Individual HTML files for each email

## Customize Before Sending

- Replace \`[your Gumroad/Ko-fi link]\` with your actual product link
- Replace \`hello@wealthlab.example.com\` with your real sender email
- Update \`FROM_NAME\` and \`FROM_EMAIL\` in \`scripts/email-sequence-automation.mjs\`
- Add your unsubscribe link URL in the HTML footer
`;

  fs.writeFileSync(path.join(OUTPUT, "email-sequence-instructions.md"), instructions);
  log(`Email sequence instructions written to output/email-sequence-instructions.md`);
  log(`=== EMAIL SEQUENCE AUTOMATION COMPLETE ===\nGenerated ${emails.length} emails, CSV import, HTML templates, and instructions`);
}

run();
