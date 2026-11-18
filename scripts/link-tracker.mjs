/**
 * WEALTH LAB — Link Tracker
 * Tracks affiliate and outbound link clicks from your micro-tools.
 * Generates a tracking JSON file and HTML dashboard.
 * Run with: node scripts/link-tracker.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const OPS = path.join(LAB, "ops");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

const TRACKED_LINKS = [
  { name: "Systeme.io Affiliate", url: "https://systeme.io/?sa=YOUR_ID", type: "affiliate" },
  { name: "ClickBank Marketplace", url: "https://clickbank.com/", type: "affiliate" },
  { name: "Gumroad Storefront", url: "https://gumroad.com/", type: "storefront" },
  { name: "Ko-fi Page", url: "https://ko-fi.com/", type: "storefront" },
  { name: "Amazon Associates", url: "https://amazon.com/", type: "affiliate" },
];

function run() {
  const trackingData = {
    generatedAt: new Date().toISOString(),
    links: TRACKED_LINKS.map((l, i) => ({
      id: `link-${i}`,
      ...l,
      clicks: 0,
      conversions: 0,
      ctr: 0,
    })),
  };

  fs.mkdirSync(OPS, { recursive: true });
  const trackingPath = path.join(OPS, "tracking-data.json");
  fs.writeFileSync(trackingPath, JSON.stringify(trackingData, null, 2));
  log(`Tracking data written to ${trackingPath}`);

  // Generate HTML dashboard
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Link Tracker Dashboard — Wealth Lab</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { text-align: left; padding: 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #334155; }
  td { padding: 12px; border-bottom: 1px solid #334155; font-size: 14px; }
  tr:hover { background: rgba(34, 211, 238, 0.05); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .badge.affiliate { background: rgba(34, 211, 238, 0.15); color: #22d3ee; }
  .badge.storefront { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
  .cta-link { color: #22d3ee; text-decoration: none; }
  .cta-link:hover { text-decoration: underline; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
</style>
</head>
<body>

<div class="container">
  <h1>Link <span>Tracker</span> Dashboard</h1>
  <p class="sub">Monitor affiliate and outbound link performance. Replace placeholder URLs with your real affiliate links.</p>

  <table>
    <thead>
      <tr>
        <th>Link Name</th>
        <th>Type</th>
        <th>URL</th>
        <th>Clicks</th>
        <th>Conversions</th>
        <th>CTR</th>
      </tr>
    </thead>
    <tbody>
      ${TRACKED_LINKS.map((l, i) => `
      <tr>
        <td>${l.name}</td>
        <td><span class="badge ${l.type}">${l.type}</span></td>
        <td><a href="${l.url}" class="cta-link" target="_blank" rel="noopener">${l.url}</a></td>
        <td>0</td>
        <td>0</td>
        <td>0.0%</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <p style="margin-top:24px; font-size:12px; color:#64748b;">
    To enable real tracking, replace the placeholder URLs in <code>scripts/link-tracker.mjs</code> with your actual affiliate links, then add click-tracking logic to your micro-tool HTML files.
  </p>

  <div class="footer">
    Built by <a href="https://github.com" target="_blank" rel="noopener">Wealth Lab</a> — Free micro-tool.
  </div>
</div>

</body>
</html>`;

  const dashboardPath = path.join(OPS, "link-tracker-dashboard.html");
  fs.writeFileSync(dashboardPath, html);
  log(`Link tracker dashboard written to ${dashboardPath}`);
  log(`Tracked ${TRACKED_LINKS.length} links. Replace placeholder URLs with real affiliate links when keys are available.`);
}

run();
