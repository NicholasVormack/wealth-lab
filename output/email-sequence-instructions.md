# Email Sequence Import Instructions

## Platform: Mailchimp (Free Tier)

1. Go to Mailchimp → Audience → All contacts
2. Click "Import contacts" → "Upload file"
3. Upload: `output/email-sequence-import.csv`
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

- `output/email-sequence-import.csv` — All emails in CSV format for bulk import
- `output/email-sequences/` — Individual HTML files for each email

## Customize Before Sending

- Replace `[your Gumroad/Ko-fi link]` with your actual product link
- Replace `hello@wealthlab.example.com` with your real sender email
- Update `FROM_NAME` and `FROM_EMAIL` in `scripts/email-sequence-automation.mjs`
- Add your unsubscribe link URL in the HTML footer
