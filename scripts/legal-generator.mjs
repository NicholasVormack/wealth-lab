/**
 * WEALTH LAB — Legal Generator
 * Generates privacy policy, terms of service, and affiliate disclosure pages.
 * Required for GDPR compliance, affiliate programs, and professional appearance.
 * Run with: node scripts/legal-generator.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveSiteUrl } from "./lib/site.mjs";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(LAB, "output");
const HISTORY_PATH = path.join(LAB, "history.log");

function log(message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${message}\n`;
  fs.appendFileSync(HISTORY_PATH, line);
  process.stdout.write(line);
}

const SITE_NAME = "Wealth Lab";
const SITE_URL = resolveSiteUrl();
const CONTACT_EMAIL = "hello@wealthlab.example.com";
const EFFECTIVE_DATE = "2026-11-14";

const privacyPolicy = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Privacy Policy — ${SITE_NAME}</title>
<meta name="description" content="How Wealth Lab handles data: no cookies, no visitor tracking, and what our email and affiliate links actually do." />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; color: #22d3ee; }
  p { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .back-link { display: inline-block; margin-bottom: 24px; color: #94a3b8; font-size: 12px; text-decoration: none; }
  .back-link:hover { color: #22d3ee; }
</style>
</head>
<body>

<a href="index.html" class="back-link wl-back">&#9654; Back to Home</a>

<h1>Privacy <span>Policy</span></h1>
<p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>

<h2>1. Information We Collect</h2>
<p>${SITE_NAME} does not collect personal information from visitors to our micro-tools and articles. We do not use cookies, tracking scripts, or analytics that identify individual users.</p>

<h2>2. Email Subscriptions</h2>
<p>If you subscribe to our newsletter, your email address is stored by our email service provider (Mailchimp, MailerLite, or similar). You can unsubscribe at any time using the unsubscribe link in any email.</p>

<h2>3. Affiliate Links</h2>
<p>Some pages on this site contain affiliate links. If you click an affiliate link and make a purchase, we may receive a commission at no additional cost to you. This helps support the site.</p>

<h2>4. Third-Party Sites</h2>
<p>Our site may link to external websites (GitHub Pages, Medium, Dev.to, Gumroad, etc.). We are not responsible for the privacy practices of those sites.</p>

<h2>5. Children's Privacy</h2>
<p>Our site is not directed to children under 13. We do not knowingly collect personal information from children under 13.</p>

<h2>6. Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. Changes are effective when posted on this page.</p>

<h2>7. Contact Us</h2>
<p>If you have questions about this privacy policy, contact us at: ${CONTACT_EMAIL}</p>

<div class="footer">
  Built by <a href="index.html">${SITE_NAME}</a> — Free micro-tools.
</div>

</body>
</html>`;

const termsOfService = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Terms of Service — ${SITE_NAME}</title>
<meta name="description" content="The terms that apply when you use Wealth Lab's free calculators, generators and guides." />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; color: #22d3ee; }
  p { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .back-link { display: inline-block; margin-bottom: 24px; color: #94a3b8; font-size: 12px; text-decoration: none; }
  .back-link:hover { color: #22d3ee; }
</style>
</head>
<body>

<a href="index.html" class="back-link wl-back">&#9654; Back to Home</a>

<h1>Terms of <span>Service</span></h1>
<p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>

<h2>1. Acceptance of Terms</h2>
<p>By using ${SITE_NAME} (${SITE_URL}), you agree to these Terms of Service. If you do not agree, do not use our site.</p>

<h2>2. Use of Micro-Tools</h2>
<p>Our micro-tools (calculators, generators, analyzers) are provided for informational purposes only. They are not financial, legal, or professional advice. Results are estimates and may not reflect actual outcomes.</p>

<h2>3. No Guarantees</h2>
<p>${SITE_NAME} does not guarantee any specific income, results, or outcomes from using our tools, articles, or following our strategies. Individual results vary.</p>

<h2>4. Affiliate Relationships</h2>
<p>We participate in affiliate programs (Systeme.io, ClickBank, ShareASale, Amazon Associates, etc.). We may earn commissions from qualifying purchases made through our affiliate links.</p>

<h2>5. Limitation of Liability</h2>
<p>To the fullest extent permitted by law, ${SITE_NAME} is not liable for any indirect, incidental, or consequential damages arising from your use of our site or tools.</p>

<h2>6. Changes to Terms</h2>
<p>We may update these Terms of Service at any time. Continued use of the site constitutes acceptance of the updated terms.</p>

<h2>7. Contact Us</h2>
<p>If you have questions about these terms, contact us at: ${CONTACT_EMAIL}</p>

<div class="footer">
  Built by <a href="index.html">${SITE_NAME}</a> — Free micro-tools.
</div>

</body>
</html>`;

const affiliateDisclosure = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Affiliate Disclosure — ${SITE_NAME}</title>
<meta name="description" content="Wealth Lab's FTC affiliate disclosure: which programs we participate in and what it means for you." />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; min-height: 100vh; padding: 40px 20px; line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  h1 { font-size: 26px; margin-bottom: 8px; letter-spacing: -0.5px; }
  h1 span { color: #22d3ee; }
  h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; color: #22d3ee; }
  p { color: #cbd5e1; margin-bottom: 16px; font-size: 14px; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center; }
  .footer a { color: #22d3ee; text-decoration: none; }
  .back-link { display: inline-block; margin-bottom: 24px; color: #94a3b8; font-size: 12px; text-decoration: none; }
  .back-link:hover { color: #22d3ee; }
</style>
</head>
<body>

<a href="index.html" class="back-link wl-back">&#9654; Back to Home</a>

<h1>Affiliate <span>Disclosure</span></h1>
<p><strong>Effective date:</strong> ${EFFECTIVE_DATE}</p>

<h2>FTC Affiliate Disclosure</h2>
<p>${SITE_NAME} participates in affiliate marketing programs. This means we may earn a commission when you click on links to products or services we recommend and make a purchase.</p>

<h2>What This Means for You</h2>
<p>There is no additional cost to you when you use our affiliate links. The commission is paid by the merchant, not by you. In some cases, you may even receive a discount or bonus through our links.</p>

<h2>Affiliate Programs We Participate In</h2>
<ul style="margin-bottom: 16px; padding-left: 20px; color: #cbd5e1;">
  <li>Systeme.io — 40% recurring commission</li>
  <li>ClickBank — digital product affiliate commissions</li>
  <li>ShareASale — various merchant commissions</li>
  <li>Amazon Associates — qualifying purchase commissions</li>
  <li>Gumroad — creator affiliate commissions</li>
  <li>Ko-fi — creator affiliate commissions</li>
</ul>

<h2>Our Commitment to Honesty</h2>
<p>We only recommend products and services that we have personally used or thoroughly researched. Our reviews and recommendations are based on our own experience and analysis, not on the commissions we might receive.</p>

<h2>Your Responsibility</h2>
<p>Before making any purchase, please do your own research. We are not responsible for the quality, pricing, or terms of third-party products or services.</p>

<h2>Contact Us</h2>
<p>If you have questions about our affiliate relationships, contact us at: ${CONTACT_EMAIL}</p>

<div class="footer">
  Built by <a href="index.html">${SITE_NAME}</a> — Free micro-tools.
</div>

</body>
</html>`;

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  fs.writeFileSync(path.join(OUTPUT, "privacy-policy.html"), privacyPolicy);
  fs.writeFileSync(path.join(OUTPUT, "terms-of-service.html"), termsOfService);
  fs.writeFileSync(path.join(OUTPUT, "affiliate-disclosure.html"), affiliateDisclosure);

  log("Legal pages generated: privacy-policy.html, terms-of-service.html, affiliate-disclosure.html");
  log("These are required for GDPR compliance, affiliate program approval, and professional appearance.");
  log("=== LEGAL GENERATOR COMPLETE ===");
}

run();
