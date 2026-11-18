/**
 * WEALTH LAB — Revenue Tracker
 * Tracks income across all monetization endpoints and generates a dashboard.
 * Run with: node scripts/revenue-tracker.mjs
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

function run() {
  const revenueData = {
    updatedAt: new Date().toISOString(),
    streams: [
      { name: "Systeme.io Affiliate", type: "recurring", monthly: 0, currency: "USD", notes: "40% recurring commission" },
      { name: "ClickBank Affiliate", type: "one-time", monthly: 0, currency: "USD", notes: "Instant approval digital products" },
      { name: "Gumroad Products", type: "one-time", monthly: 0, currency: "USD", notes: "Digital products storefront" },
      { name: "Ko-fi Donations", type: "one-time", monthly: 0, currency: "USD", notes: "Donations + digital products" },
      { name: "Amazon Associates", type: "one-time", monthly: 0, currency: "USD", notes: "Physical product affiliate" },
      { name: "Service Income", type: "project-based", monthly: 0, currency: "USD", notes: "Freelance/consulting work" },
      { name: "YouTube Ad Revenue", type: "recurring", monthly: 0, currency: "USD", notes: "Requires 1,000 subs + 4,000 watch hours" },
    ],
    totalMonthly: 0,
    goal: 1000,
  };

  revenueData.totalMonthly = revenueData.streams.reduce((sum, s) => sum + s.monthly, 0);
  revenueData.progressToGoal = Math.round((revenueData.totalMonthly / revenueData.goal) * 100);

  const trackingPath = path.join(OUTPUT, "revenue-data.json");
  fs.writeFileSync(trackingPath, JSON.stringify(revenueData, null, 2));
  log(`Revenue data written to ${trackingPath}`);

  // Generate HTML dashboard
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Revenue Tracker — Wealth Lab</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  .goal-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #22d3ee; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; }
  .goal-amount { font-size: 48px; font-weight: 800; color: #22d3ee; }
  .goal-label { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
  .progress-bar { width: 100%; height: 8px; background: #334155; border-radius: 4px; margin-top: 16px; overflow: hidden; }
  .progress-fill { height: 100%; background: #22d3ee; width: 0%; transition: width 0.5s ease; }
  .progress-text { font-size: 12px; color: #94a3b8; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { text-align: left; padding: 12px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #334155; }
  td { padding: 12px; border-bottom: 1px solid #334155; font-size: 14px; }
  tr:hover { background: rgba(34, 211, 238, 0.05); }
  .stream-type { font-size: 11px; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 700; }
  .type-recurring { background: rgba(34, 211, 238, 0.15); color: #22d3ee; }
  .type-onetime { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
  .type-project { background: rgba(249, 115, 22, 0.15); color: #f59e0b; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .empty { color: #64748b; font-style: italic; }
</style>
</head>
<body>

<div class="container">
  <h1>Revenue <span>Tracker</span></h1>
  <p class="sub">Track income across all monetization endpoints. Update the values in scripts/revenue-tracker.mjs as you earn.</p>

  <div class="goal-card">
    <div class="goal-amount">\$${revenueData.totalMonthly.toFixed(0)}</div>
    <div class="goal-label">Monthly Revenue / \$${revenueData.goal} Goal</div>
    <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
    <div class="progress-text">${revenueData.progressToGoal}% to goal</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Stream</th>
        <th>Type</th>
        <th>Monthly</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${revenueData.streams.map((s) => `
      <tr>
        <td>${s.name}</td>
        <td><span class="stream-type type-${s.type.replace(/\s+/g, '-')}">${s.type}</span></td>
        <td>\$${s.monthly.toFixed(2)}</td>
        <td class="empty">${s.notes}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <p style="margin-top:24px; font-size:12px; color:#64748b;">
    To track real revenue, update the monthly values in <code>scripts/revenue-tracker.mjs</code> and re-run: <code>node scripts/revenue-tracker.mjs</code>
  </p>

  <div class="footer">
    Built by <a href="https://github.com" target="_blank" rel="noopener">Wealth Lab</a> — Free micro-tool.
  </div>
</div>

<script>
document.getElementById("progressFill").style.width = "${revenueData.progressToGoal}%";
</script>

</body>
</html>`;

  const dashboardPath = path.join(OUTPUT, "revenue-dashboard.html");
  fs.writeFileSync(dashboardPath, html);
  log(`Revenue dashboard written to ${dashboardPath}`);
  log(`Total monthly revenue tracked: \$${revenueData.totalMonthly.toFixed(2)}`);
}

run();
