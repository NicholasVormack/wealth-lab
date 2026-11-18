/**
 * WEALTH LAB — Investment Tracker
 * Tracks investment portfolio, dividend reinvestment, and DCA progress.
 * Reads from investment-data.json if exists, otherwise creates template.
 * Run with: node scripts/investment-tracker.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const DATA_PATH = path.join(OUTPUT, "investment-data.json");
const DASHBOARD_PATH = path.join(OUTPUT, "investment-dashboard.html");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  // Load or create investment data
  let data;
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } else {
    data = {
      createdAt: new Date().toISOString(),
      accounts: [
        { name: "Fidelity Brokerage", type: "taxable", balance: 0, monthlyContribution: 0 },
        { name: "Roth IRA", type: "tax-advantaged", balance: 0, monthlyContribution: 0 },
        { name: "Robinhood", type: "taxable", balance: 0, monthlyContribution: 0 }
      ],
      holdings: [
        { ticker: "VOO", name: "Vanguard S&P 500 ETF", type: "index", shares: 0, avgCost: 0, dividendYield: 0.03 },
        { ticker: "VTI", name: "Vanguard Total Stock Market ETF", type: "index", shares: 0, avgCost: 0, dividendYield: 0.02 },
        { ticker: "SCHD", name: "Schwab US Dividend Equity", type: "dividend", shares: 0, avgCost: 0, dividendYield: 0.035 },
        { ticker: "FXAIX", name: "Fidelity 500 Index Fund", type: "index", shares: 0, avgCost: 0, dividendYield: 0.03 }
      ],
      dcaSchedule: {
        monthlyAmount: 100,
        startDate: new Date().toISOString().split("T")[0],
        frequency: "monthly"
      },
      dividendsReinvested: 0,
      totalContributions: 0,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    log(`Created investment data template at ${DATA_PATH}`);
  }

  // Calculate totals
  let totalBalance = 0;
  let totalContributions = data.totalContributions || 0;
  let totalDividends = data.dividendsReinvested || 0;

  data.accounts.forEach(a => { totalBalance += a.balance || 0; });
  data.holdings.forEach(h => { totalContributions += (h.shares || 0) * (h.avgCost || 0); });

  const annualDividendIncome = data.holdings.reduce((sum, h) => {
    return sum + ((h.shares || 0) * (h.avgCost || 0) * (h.dividendYield || 0));
  }, 0);

  const monthlyDividendIncome = annualDividendIncome / 12;

  // Generate HTML dashboard
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Investment Dashboard — Wealth Lab</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; }
  .container { max-width: 1000px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  .score-card { display: flex; gap: 16px; margin-bottom: 30px; }
  .score-item { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; }
  .score-item .value { font-size: 36px; font-weight: 800; color: #22d3ee; }
  .score-item .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; border-radius: 8px; overflow: hidden; margin-top: 20px; }
  th { text-align: left; padding: 12px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #334155; }
  td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; color: #cbd5e1; }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: rgba(34, 211, 238, 0.05); }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .setup { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-top: 30px; }
  .setup h3 { color: #22d3ee; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .setup ul { list-style: none; padding: 0; }
  .setup li { margin-bottom: 8px; color: #cbd5e1; font-size: 13px; padding-left: 20px; position: relative; }
  .setup li::before { content: "□"; color: #475569; position: absolute; left: 0; }
</style>
</head>
<body>

<div class="container">
  <h1>Investment <span>Dashboard</span></h1>
  <p class="sub">Track your investment portfolio, dividend reinvestment, and DCA progress. Update <code>output/investment-data.json</code> with your real numbers.</p>

  <div class="score-card">
    <div class="score-item">
      <div class="value">$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
      <div class="label">Total Portfolio Value</div>
    </div>
    <div class="score-item">
      <div class="value">$${totalContributions.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
      <div class="label">Total Contributions</div>
    </div>
    <div class="score-item">
      <div class="value">$${(totalBalance - totalContributions).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
      <div class="label">Growth</div>
    </div>
    <div class="score-item">
      <div class="value">$${annualDividendIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/yr</div>
      <div class="label">Est. Annual Dividends</div>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Account</th><th>Type</th><th>Balance</th><th>Monthly Contribution</th></tr>
    </thead>
    <tbody>
      ${data.accounts.map(a => `
        <tr>
          <td>${a.name}</td>
          <td>${a.type}</td>
          <td>$${(a.balance || 0).toLocaleString()}</td>
          <td>$${(a.monthlyContribution || 0).toLocaleString()}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <table style="margin-top:24px;">
    <thead>
      <tr><th>Holding</th><th>Type</th><th>Shares</th><th>Avg Cost</th><th>Dividend Yield</th><th>Est. Annual Div</th></tr>
    </thead>
    <tbody>
      ${data.holdings.map(h => {
        const estDiv = ((h.shares || 0) * (h.avgCost || 0) * (h.dividendYield || 0));
        return `
        <tr>
          <td>${h.ticker}</td>
          <td>${h.type}</td>
          <td>${(h.shares || 0).toFixed(4)}</td>
          <td>$${(h.avgCost || 0).toFixed(2)}</td>
          <td>${(h.dividendYield * 100).toFixed(1)}%</td>
          <td>$${estDiv.toFixed(2)}/yr</td>
        </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  <div class="setup">
    <h3>Investment Setup Checklist</h3>
    <ul>
      <li>Open Fidelity, Schwab, or Vanguard account (free, $0 minimum)</li>
      <li>Claim free stock bonuses (Robinhood, Webull)</li>
      <li>Set up automatic monthly investment ($25–$100/month)</li>
      <li>Buy index fund: FXAIX, FZROX, VOO, or VTI</li>
      <li>Enable DRIP (dividend reinvestment)</li>
      <li>Add dividend ETF: SCHD or VYM</li>
      <li>Route side hustle income → emergency fund → investments</li>
      <li>Update investment-data.json with real balances monthly</li>
    </ul>
  </div>

  <div class="footer">
    Built by <a href="https://github.com" target="_blank" rel="noopener">Wealth Lab</a> — Free micro-tool.
  </div>
</div>

</body>
</html>`;

  fs.writeFileSync(DASHBOARD_PATH, html);
  log(`Investment dashboard written to ${DASHBOARD_PATH}`);
  log(`Total portfolio: $${totalBalance.toLocaleString()} | Annual dividends: $${annualDividendIncome.toFixed(2)}/yr`);
  log(`=== INVESTMENT TRACKER COMPLETE ===\n`);
}

run();
