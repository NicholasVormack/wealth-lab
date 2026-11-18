/**
 * WEALTH LAB — Affiliate Link Cloaker
 * Generates clean, branded redirect pages for affiliate links.
 * Instead of showing ugly affiliate URLs, show your own domain with a redirect.
 * Run with: node scripts/link-cloaker.mjs
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

const affiliateLinks = [
  { slug: "systeme", name: "Systeme.io", url: "https://systeme.io/?sa=YOUR_ID", description: "All-in-one business platform — 40% recurring commission" },
  { slug: "clickbank", name: "ClickBank", url: "https://clickbank.com/", description: "Digital products marketplace — instant approval" },
  { slug: "gumroad", name: "Gumroad", url: "https://gumroad.com/", description: "Digital product storefront — free to start" },
  { slug: "kofi", name: "Ko-fi", url: "https://ko-fi.com/", description: "Donations + digital products — free tier" },
  { slug: "amazon", name: "Amazon Associates", url: "https://amazon.com/", description: "Physical products affiliate — apply for account" },
];

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });
  if (!fs.existsSync(path.join(OUTPUT, "go"))) fs.mkdirSync(path.join(OUTPUT, "go"), { recursive: true });

  let indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Link Cloaker — Wealth Lab</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; background: #0f172a; border: 1px solid #334155; border-radius: 8px; overflow: hidden; margin-top: 20px; }
  th { text-align: left; padding: 12px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #334155; }
  td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: rgba(34, 211, 238, 0.05); }
  .slug { font-family: "Courier New", monospace; color: #22d3ee; font-weight: 700; }
  .url { color: #94a3b8; font-size: 11px; word-break: break-all; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .install { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-top: 30px; }
</style>
</head>
<body>

<div class="container">
  <h1>Affiliate <span>Link</span> Cloaker</h1>
  <p class="sub">Create clean, branded redirect URLs for your affiliate links. Use your own domain instead of ugly affiliate URLs.</p>

  <table>
    <thead>
      <tr>
        <th>Your Link</th>
        <th>Destination</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${affiliateLinks.map((l) => `
      <tr>
        <td><span class="slug">/go/${l.slug}</span></td>
        <td class="url">${l.url}</td>
        <td>${l.description}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="install">
    <h3 style="color:#22d3ee; margin-bottom:12px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">How to Use</h3>
    <p style="font-size:13px; color:#cbd5e1; margin-bottom:16px;">
      1. Replace the placeholder URLs in <code>scripts/link-cloaker.mjs</code> with your real affiliate links<br>
      2. Run <code>node scripts/link-cloaker.mjs</code> to regenerate redirect pages<br>
      3. Deploy the <code>go/</code> folder to GitHub Pages alongside your micro-tools<br>
      4. Use <code>yourdomain.com/go/systeme</code> instead of long affiliate URLs<br>
      5. Each redirect page sends visitors to your affiliate link with a brief delay
    </p>
    <p style="font-size:12px; color:#64748b;">
      Benefit: Clean links look more trustworthy, are easier to remember, and you can change the destination without updating all your content.
    </p>
  </div>

  <div class="footer">
    Built by <a href="index.html">Wealth Lab</a> — Free micro-tool.
  </div>
</div>

</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT, "link-cloaker.html"), indexContent);
  log("Link cloaker index written to output/link-cloaker.html");

  // Only publish redirects that actually go somewhere. A page that sends a
  // visitor to a "YOUR_ID" placeholder is worse than no page at all.
  const configured = affiliateLinks.filter((l) => !/YOUR_|example\.com/i.test(l.url));
  const skipped = affiliateLinks.filter((l) => !configured.includes(l));

  // Clear stale redirects so removed or unconfigured links stop serving
  const goDir = path.join(OUTPUT, "go");
  for (const f of fs.readdirSync(goDir)) {
    if (f.endsWith(".html")) fs.unlinkSync(path.join(goDir, f));
  }

  configured.forEach((link) => {
    const redirectPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Redirecting to ${link.name}...</title>
<meta name="robots" content="noindex, follow" />
<meta http-equiv="refresh" content="3;url=${link.url}" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .container { text-align: center; padding: 40px; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; }
  .spinner { width: 40px; height: 40px; border: 3px solid #334155; border-top: 3px solid #22d3ee; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  h1 { font-size: 24px; margin-bottom: 8px; color: #f1f5f9; }
  h1 span { color: #22d3ee; }
  p { color: #94a3b8; margin-bottom: 20px; }
  .link { color: #22d3ee; text-decoration: none; font-weight: 600; word-break: break-all; }
  .link:hover { text-decoration: underline; }
  .countdown { font-family: monospace; color: #64748b; font-size: 14px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Redirecting to <span>${link.name}</span>...</h1>
    <p>You'll be sent to <span class="link">${link.url}</span> in <span id="countdown">3</span> seconds.</p>
    <p style="margin-top:24px;">Not redirected? <a href="${link.url}" class="link">Click here</a></p>
    <div class="countdown" id="countdownDisplay"></div>
  </div>
  <script>
    let seconds = 3;
    const display = document.getElementById('countdownDisplay');
    const interval = setInterval(() => {
      seconds--;
      display.textContent = \`Redirecting in \${seconds}...\`;
      if (seconds <= 0) clearInterval(interval);
    }, 1000);
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(OUTPUT, "go", `${link.slug}.html`), redirectPage);
    log(`Redirect page created: output/go/${link.slug}.html → ${link.url}`);
  });

  // Generate .htaccess for Apache (optional, for custom domains)
  const htaccess = `# Wealth Lab Link Cloaker Redirects
# Add this to your .htaccess file if using Apache on a custom domain

${affiliateLinks.map((l) => `Redirect 302 /go/${l.slug} ${l.url}`).join("\n")}

`;

  fs.writeFileSync(path.join(OUTPUT, ".htaccess-example"), htaccess);
  log(".htaccess example written to output/.htaccess-example");

  log("=== LINK CLOAKER COMPLETE ===");
  log(`Generated ${configured.length} redirect pages in output/go/`);
  if (skipped.length) {
    log(`Skipped ${skipped.length} unconfigured link(s) (placeholder URLs): ${skipped.map((l) => l.slug).join(", ")}`);
  }
  log("Use /go/[slug] URLs in your content instead of raw affiliate links.");
}

run();
