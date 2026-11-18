/**
 * WEALTH LAB — Analytics Tracker
 * Generates simple analytics tracking code and a dashboard for monitoring traffic.
 * No Google Analytics needed — privacy-friendly, self-hosted tracking.
 * Run with: node scripts/analytics-tracker.mjs
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

const trackingScript = `// Wealth Lab Analytics — Privacy-friendly, self-hosted tracking
// Add this script to your micro-tool HTML files before the closing </body> tag

(function() {
  'use strict';

  const trackEvent = function(eventType, eventData) {
    const data = {
      type: eventType,
      page: window.location.pathname,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Store in localStorage for privacy (no external requests)
    try {
      const existing = JSON.parse(localStorage.getItem('wl_events') || '[]');
      existing.push(data);
      // Keep only last 500 events
      if (existing.length > 500) existing.splice(0, existing.length - 500);
      localStorage.setItem('wl_events', JSON.stringify(existing));
    } catch (e) {
      // LocalStorage not available, silently ignore
    }

    // Log to console for debugging
    if (window.location.hostname === 'localhost') {
      console.log('[Wealth Lab Analytics]', data);
    }
  };

  // Track page view on load
  window.addEventListener('DOMContentLoaded', function() {
    trackEvent('page_view');
  });

  // Track button clicks
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, a');
    if (btn) {
      trackEvent('click', {
        element: btn.tagName.toLowerCase(),
        text: btn.innerText.trim().substring(0, 50),
        href: btn.getAttribute('href') || null,
        id: btn.id || null,
      });
    }
  });

  // Expose for manual tracking
  window.wlAnalytics = { track: trackEvent };
})();

// Usage example:
// window.wlAnalytics.track('affiliate_click', { destination: 'systeme.io' });
// window.wlAnalytics.track('tool_use', { tool: 'side-hustle-calculator' });
`;

const analyticsDashboard = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Analytics Dashboard — Wealth Lab</title>
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
  .score-item .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; border-radius: 8px; overflow: hidden; margin-top: 20px; }
  th { text-align: left; padding: 12px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #334155; }
  td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; color: #cbd5e1; }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: rgba(34, 211, 238, 0.05); }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .empty-state { text-align: center; padding: 40px; color: #64748b; }
  .install-code { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-top: 30px; font-family: monospace; font-size: 12px; overflow-x: auto; }
</style>
</head>
<body>

<div class="container">
  <h1>Analytics <span>Dashboard</span></h1>
  <p class="sub">Privacy-friendly, self-hosted analytics. Data is stored locally in your browser — no external tracking.</p>

  <div class="score-card">
    <div class="score-item">
      <div class="value" id="totalViews">0</div>
      <div class="label">Page Views</div>
    </div>
    <div class="score-item">
      <div class="value" id="totalClicks">0</div>
      <div class="label">Button Clicks</div>
    </div>
    <div class="score-item">
      <div class="value" id="uniqueDays">0</div>
      <div class="label">Active Days</div>
    </div>
  </div>

  <div id="eventsTable">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Page</th>
          <th>Referrer</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  </div>

  <div class="install-code">
    <strong>Install this tracking script on your micro-tool pages:</strong><br>
    Add before the closing <code>&lt;/body&gt;</code> tag:
  </div>
  <div class="install-code" id="trackingCode"></div>

  <div class="footer">
    Built by <a href="https://github.com" target="_blank" rel="noopener">Wealth Lab</a> — Free micro-tool.
  </div>
</div>

<script>
// Load events from localStorage
const events = JSON.parse(localStorage.getItem('wl_events') || '[]');

document.getElementById('totalViews').textContent = events.filter(e => e.type === 'page_view').length;
document.getElementById('totalClicks').textContent = events.filter(e => e.type === 'click').length;
const days = new Set(events.map(e => e.timestamp.split('T')[0]));
document.getElementById('uniqueDays').textContent = days.size;

const tableBody = document.getElementById('tableBody');
events.slice().reverse().forEach(e => {
  const row = document.createElement('tr');
  const time = new Date(e.timestamp).toLocaleString();
  const dataStr = Object.entries(e).filter(([k]) => !['type','page','referrer','timestamp'].includes(k)).map(([k,v]) => \`\${k}: \${v}\`).join(', ');
  row.innerHTML = \`
    <td>\${time}</td>
    <td>\${e.type}</td>
    <td>\${e.page}</td>
    <td>\${e.referrer}</td>
    <td>\${dataStr || '-'}</td>
  \`;
  tableBody.appendChild(row);
});

// Show tracking script
const trackingCode = \`\`\`;
document.getElementById('trackingCode').textContent = trackingCode;
</script>

</body>
</html>`;

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  // Write the tracking script as a standalone JS file
  fs.writeFileSync(path.join(OUTPUT, "analytics-tracker.js"), trackingScript);
  log("Analytics tracking script written to output/analytics-tracker.js");

  // Write the analytics dashboard HTML
  fs.writeFileSync(path.join(OUTPUT, "analytics-dashboard.html"), analyticsDashboard);
  log("Analytics dashboard written to output/analytics-dashboard.html");

  log("=== ANALYTICS TRACKER COMPLETE ===");
  log("Install analytics-tracker.js on your micro-tool pages for privacy-friendly tracking.");
  log("Open analytics-dashboard.html to view local event data.");
}

run();
