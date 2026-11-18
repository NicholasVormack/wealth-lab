# AUTO-PILOT ORCHESTRATOR — Setup & Reality Guide

## What This Does (Automatically)

The `scripts/auto-pilot.mjs` orchestrator handles everything that **can** be automated:

| Task | Automated? | Notes |
|------|-----------|-------|
| Build static HTML assets | ✅ Yes | Runs `asset-builder.mjs` |
| Generate content queue | ✅ Yes | Pre-writes X, Reddit, Medium, Dev.to posts |
| Link tracking | ✅ Yes | Monitors affiliate/outbound clicks |
| Revenue tracking | ✅ Yes | Updates revenue dashboard |
| Content repurposing | ✅ Yes | Turns articles into social posts |
| A/B test variants | ✅ Yes | Generates headline/CTA variations |
| Legal pages | ✅ Yes | Privacy policy, terms, affiliate disclosure |
| Email sequences | ✅ Yes | CSV + HTML templates for import |
| Analytics tracking | ✅ Yes | Privacy-friendly JS + dashboard |
| Landing page template | ✅ Yes | Conversion-focused HTML |
| Link cloaking | ✅ Yes | Branded `/go/` redirect pages |
| GitHub Pages deploy | ✅ Yes | If git repo configured in output/ |

## What Requires MANUAL Setup (Cannot Be Automated)

These are hard limits imposed by platforms, laws, and bot detection:

| Task | Why Manual | Time Required |
|------|-----------|---------------|
| Create GitHub account | Platform terms | 5 minutes |
| Create GitHub repo & enable Pages | Platform terms | 10 minutes |
| Create Medium account + API token | Platform terms + bot detection | 15 minutes |
| Create Dev.to account + API key | Platform terms | 10 minutes |
| Create X/Twitter developer app | Platform terms + approval wait | 30 minutes–2 days |
| Create Reddit app + credentials | Platform terms + karma requirements | 20 minutes |
| Create YouTube API key | Google Cloud + project setup | 20 minutes |
| Create Gumroad/Ko-fi account | Platform terms + identity | 15 minutes |
| Amazon Associates approval | Manual review + 3 qualified sales | 2–4 weeks |
| Payment processor KYC (Stripe, PayPal) | Legal requirement (anti-fraud) | 1–7 days |
| FTC disclosure compliance | Legal requirement | Ongoing |
| Strategy pivots based on revenue | Requires human judgment | Ongoing |

## Setup Instructions

### 1. Create GitHub Pages Site (Required for everything)

```bash
# Create account at github.com
# Create public repo named "wealth-lab"
# Enable Pages in Settings → Pages (source: main branch)

cd /Users/nicholasvormack/Documents/Default Project/wealth-lab/output/
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOURUSERNAME/wealth-lab.git
git push -u origin main
```

Your site: `https://YOURUSERNAME.github.io/wealth-lab/`

### 2. Add Operator Keys (For Auto-Publishing)

Edit `./wealth-lab/.env` and add keys for platforms you want to auto-post to:

```
VERCEL_TOKEN=your_token
MEDIUM_ACCESS_TOKEN=your_token
DEVTO_API_KEY=your_key
GUMROAD_ACCESS_TOKEN=your_key
KOFI_API_KEY=your_key
AMAZON_ASSOCIATE_TAG=your_tag
X_API_KEY=your_key
X_API_SECRET=your_secret
X_ACCESS_TOKEN=your_token
X_ACCESS_SECRET=your_secret
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password
YOUTUBE_API_KEY=your_key
```

Then re-run:
```bash
node scripts/auto-pilot.mjs
```

### 3. Set Up Cron (Optional — Continuous Automation)

```bash
# Run auto-pilot every 6 hours
0 */6 * * * /usr/bin/node /Users/nicholasvormack/Documents/Default Project/wealth-lab/scripts/auto-pilot.mjs >> /Users/nicholasvormack/Documents/Default Project/wealth-lab/output/cron.log 2>&1
```

Or daily:
```bash
0 9 * * * /usr/bin/node /Users/nicholasvormack/Documents/Default Project/wealth-lab/scripts/auto-pilot.mjs >> /Users/nicholasvormack/Documents/Default Project/wealth-lab/output/cron.log 2>&1
```

## What Happens When You Run Auto-Pilot

```
1. Checks .env for API keys → flips platforms to READY
2. Builds all static HTML assets (micro-tools, articles, dashboards)
3. Generates content queue (X, Reddit, Medium, Dev.to posts ready to publish)
4. Runs link tracking, revenue tracking, analytics
5. Prepares GitHub Pages deployment
6. Attempts git push if repo is configured
7. Reports what's ready and what still needs manual keys
```

## The Honest Truth

**Auto-pilot does NOT eliminate human work.** It eliminates **repetitive mechanical work** (building files, formatting posts, tracking links, generating drafts).

You still must:
- Create accounts and get API keys (one-time, ~2 hours total)
- Verify your identity with payment processors (one-time, few days)
- Create genuinely valuable content (AI drafts need your human perspective)
- Talk to customers, handle support, process refunds
- Make strategy decisions when something isn't working
- Comply with FTC disclosure, GDPR, platform terms

**What auto-pilot DOES give you:**
- Your entire infrastructure built and tested
- All content templates pre-written
- All tracking dashboards ready
- All publishing scripts ready to fire the moment you add keys
- A cron-ready orchestrator that runs on schedule

**Time to first dollar with auto-pilot:**
- Week 1: Manual setup (accounts, keys, git deploy)
- Week 2–4: UGC videos + service offers (manual outreach, ~$100–$500)
- Month 2–3: Recurring affiliates + digital products ($500–$2,000/month)
- Month 4–6: Programmatic SEO compound ($2,000–$5,000+/month)

## Files to Edit First

1. `./wealth-lab/.env` — Add your API keys
2. `./wealth-lab/state.json` — Update your niche, goals, next tasks
3. `./wealth-lab/endpoints.json` — Add/remove platforms as needed
4. `./wealth-lab/output/micro-tools/` — Your actual micro-tools (customize them)

---

*Wealth Lab Auto-Pilot Orchestrator v1.0*
*Maximum possible automation. Not zero work — but minimum mechanical work.*
