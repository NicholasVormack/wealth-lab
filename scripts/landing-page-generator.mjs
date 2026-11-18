/**
 * WEALTH LAB — Landing Page Generator
 * Generates conversion-focused landing page HTML templates for micro-tools and digital products.
 * Run with: node scripts/landing-page-generator.mjs
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

const landingPageTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{{PAGE_TITLE}} — Wealth Lab</title>
<meta name="description" content="{{META_DESCRIPTION}}" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(180deg, #020617 0%, #0f172a 100%); color: #f1f5f9; line-height: 1.6; }
  .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  
  /* Hero Section */
  .hero { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; margin-bottom: 40px; border: 1px solid #334155; }
  .hero h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
  .hero h1 span { background: linear-gradient(to right, #22d3ee, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero p { font-size: 18px; color: #94a3b8; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
  .hero .cta { display: inline-block; padding: 16px 32px; background: #22d3ee; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none; }
  .hero .cta:hover { background: #67e8f9; }

  /* Features Section */
  .features { margin-bottom: 40px; }
  .features h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #f1f5f9; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
  .feature-card { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 16px; padding: 24px; }
  .feature-card h3 { font-size: 18px; color: #22d3ee; margin-bottom: 12px; }
  .feature-card p { font-size: 14px; color: #cbd5e1; }

  /* Testimonial Section */
  .testimonials { margin-bottom: 40px; padding: 40px 20px; background: rgba(30, 41, 59, 0.4); border-radius: 24px; border: 1px solid #334155; }
  .testimonials h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #f1f5f9; }
  .testimonial { font-style: italic; color: #cbd5e1; margin-bottom: 20px; font-size: 16px; }
  .testimonial-author { font-weight: 700; color: #22d3ee; font-style: normal; font-size: 14px; margin-top: 8px; }

  /* Pricing Section */
  .pricing { margin-bottom: 40px; }
  .pricing h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #f1f5f9; }
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
  .pricing-card { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 16px; padding: 32px 24px; text-align: center; }
  .pricing-card.featured { border-color: #22d3ee; background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(30, 41, 59, 0.6) 100%); }
  .pricing-card h3 { font-size: 20px; color: #f1f5f9; margin-bottom: 8px; }
  .pricing-card .price { font-size: 36px; font-weight: 800; color: #22d3ee; margin-bottom: 16px; }
  .pricing-card .price span { font-size: 16px; color: #94a3b8; }
  .pricing-card ul { list-style: none; padding: 0; margin-bottom: 24px; text-align: left; }
  .pricing-card li { margin-bottom: 8px; color: #cbd5e1; font-size: 14px; padding-left: 20px; position: relative; }
  .pricing-card li::before { content: "✓"; color: #22d3ee; position: absolute; left: 0; font-weight: 700; }
  .pricing-card .cta { display: block; padding: 14px 24px; background: #22d3ee; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; text-decoration: none; width: 100%; }
  .pricing-card .cta:hover { background: #67e8f9; }

  /* FAQ Section */
  .faq { margin-bottom: 40px; }
  .faq h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #f1f5f9; }
  .faq-item { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 12px; }
  .faq-item h3 { font-size: 16px; color: #f1f5f9; margin-bottom: 8px; cursor: pointer; }
  .faq-item p { color: #94a3b8; font-size: 14px; display: none; }
  .faq-item.open p { display: block; }

  /* Footer CTA */
  .footer-cta { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; border: 1px solid #334155; }
  .footer-cta h2 { font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #f1f5f9; }
  .footer-cta p { color: #94a3b8; margin-bottom: 24px; }
  .footer-cta .cta { display: inline-block; padding: 16px 32px; background: #22d3ee; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; text-decoration: none; }
  .footer-cta .cta:hover { background: #67e8f9; }

  footer { text-align: center; padding: 40px 20px; color: #64748b; font-size: 12px; }
  footer a { color: #22d3ee; text-decoration: none; }

  @media (max-width: 640px) {
    .hero h1 { font-size: 32px; }
    .container { padding: 20px 16px; }
  }
</style>
</head>
<body>

<div class="container">
  <!-- Hero -->
  <section class="hero">
    <h1>{{HERO_HEADLINE}}</h1>
    <p>{{HERO_SUBHEADLINE}}</p>
    <a href="{{CTA_LINK}}" class="cta">{{CTA_TEXT}}</a>
  </section>

  <!-- Features -->
  <section class="features">
    <h2>Why {{PRODUCT_NAME}}?</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>Free Forever</h3>
        <p>No monthly fees. No hidden costs. Use it as much as you want.</p>
      </div>
      <div class="feature-card">
        <h3>No Signup Required</h3>
        <p>Start using it immediately. No email, no account, no friction.</p>
      </div>
      <div class="feature-card">
        <h3>Mobile Friendly</h3>
        <p>Works on any device — phone, tablet, or desktop.</p>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="testimonials">
    <h2>What People Say</h2>
    <div class="testimonial">
      "This tool saved me hours of work. Completely free and actually works."
      <div class="testimonial-author">— Sarah J., Freelancer</div>
    </div>
    <div class="testimonial">
      "Best free calculator I've found. Simple, fast, and accurate."
      <div class="testimonial-author">— Mike R., Side Hustler</div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="pricing">
    <h2>Simple, Transparent Pricing</h2>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Free</h3>
        <div class="price">$0<span>/forever</span></div>
        <ul>
          <li>All core features</li>
          <li>Unlimited use</li>
          <li>No signup required</li>
        </ul>
        <a href="#" class="cta">Get Started Free</a>
      </div>
      <div class="pricing-card featured">
        <h3>Pro</h3>
        <div class="price">$27<span>/one-time</span></div>
        <ul>
          <li>Everything in Free</li>
          <li>Advanced features</li>
          <li>Priority support</li>
          <li>Lifetime access</li>
        </ul>
        <a href="{{CTA_LINK}}" class="cta">Get Pro</a>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-item">
      <h3>Is this really free?</h3>
      <p>Yes. The core tool is 100% free with no signup required.</p>
    </div>
    <div class="faq-item">
      <h3>Do I need to create an account?</h3>
      <p>No. Just open the tool and start using it immediately.</p>
    </div>
    <div class="faq-item">
      <h3>Can I use this on mobile?</h3>
      <p>Yes. It works on any device with a web browser.</p>
    </div>
  </section>

  <!-- Footer CTA -->
  <section class="footer-cta">
    <h2>Ready to Get Started?</h2>
    <p>Join thousands of people using {{PRODUCT_NAME}} today.</p>
    <a href="{{CTA_LINK}}" class="cta">{{CTA_TEXT}}</a>
  </section>
</div>

<footer>
  Built by <a href="https://github.com" target="_blank" rel="noopener">Wealth Lab</a> — Free micro-tools.
</footer>

</body>
</html>`;

function run() {
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  // Generate a sample landing page for the side hustle calculator
  const pageContent = landingPageTemplate
    .replace(/{{PAGE_TITLE}}/g, "Free Side Hustle Calculator")
    .replace(/{{META_DESCRIPTION}}/g, "Calculate your side hustle profit in 30 seconds. Free tool, no signup, no email required.")
    .replace(/{{HERO_HEADLINE}}/g, "Side Hustle ROI Calculator")
    .replace(/{{HERO_SUBHEADLINE}}/g, "Estimate your monthly side hustle profit based on hours, rate, fees, and tool costs. Free. No signup. No email required.")
    .replace(/{{CTA_LINK}}/g, "micro-tools/side-hustle-calculator/")
    .replace(/{{CTA_TEXT}}/g, "Use the Free Calculator")
    .replace(/{{PRODUCT_NAME}}/g, "Side Hustle Calculator");

  fs.writeFileSync(path.join(OUTPUT, "landing-page-sample.html"), pageContent);
  log("Landing page template written to output/landing-page-sample.html");

  // Generate instructions
  const instructions = `# Landing Page Generator

## Generated File

- \`output/landing-page-sample.html\` — Sample conversion-focused landing page

## How to Use

1. Copy \`landing-page-sample.html\` to your micro-tool folder
2. Edit the template variables (headline, subheadline, CTA link, product name)
3. Replace placeholder testimonials with real ones
4. Update pricing to match your actual offer
5. Deploy to GitHub Pages alongside your micro-tools

## Customization Variables

Replace these placeholders in the HTML:

- \`{{PAGE_TITLE}}\` — Browser tab title
- \`{{META_DESCRIPTION}}\` — SEO meta description
- \`{{HERO_HEADLINE}}\` — Main headline (largest text)
- \`{{HERO_SUBHEADLINE}}\` — Supporting subheadline
- \`{{CTA_LINK}}\` — Where the CTA button links
- \`{{CTA_TEXT}}\` — Button text
- \`{{PRODUCT_NAME}}\` — Your product/tool name

## Best Practices

- Keep the headline under 10 words
- Make the CTA button stand out with contrasting color
- Include social proof (testimonials, user counts)
- Show pricing clearly, even if it's free
- Add FAQ to handle common objections
`;

  fs.writeFileSync(path.join(OUTPUT, "landing-page-instructions.md"), instructions);
  log("Landing page instructions written to output/landing-page-instructions.md");
  log("=== LANDING PAGE GENERATOR COMPLETE ===");
}

run();
