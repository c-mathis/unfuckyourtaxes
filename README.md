# Unfuck Your Taxes

A static, multi-page marketing site designed for Cloudflare Pages.

## Pages

- Home, about, services, process, resources, contact, and privacy
- Three plain-English resource articles
- `robots.txt` and `sitemap.xml` for search engines

## Creative handoff

- [Brand & Creative Handoff](design/BRAND_CREATIVE_HANDOFF.md)
- [Machine-readable design tokens](design/design-tokens.json)

## Deployment

This is dependency-free static HTML, CSS, and JavaScript. In Cloudflare Pages, set the build command to blank and the output directory to `.` (the repository root). Connect the custom domain after the first successful deployment.

The contact page and paid-traffic assessment post leads to the shared Cloudflare Worker, preserve campaign parameters, and redirect successful submissions to `/thank-you`. Email remains the fallback when the endpoint is unavailable.

## Public form consent (November 16, 2026)

UFYT texting is not active. The public quiz and contact form again use the
original enquiry notice, required phone field and original footer disclaimer.
There is no UFYT texting checkbox or rates/HELP/STOP disclosure on either form.
Privacy and Terms retain their current published wording.

For qualifying $10,001+ debt referrals only, a short “By sending” notice above
Submit replaces the general enquiry notice. There is no referral checkbox.
Submitting records the exact displayed text, version, timestamp, page and
`acceptance_method: form_submit`. The Worker accepts this version and retains
support for earlier checkbox receipts and already-open forms. Automatic Five Star
delivery continues; no customer messaging settings changed.

Current form assets: `quiz-v31.js`, `lead-form-v9.js`,
`resolution-consent-v4.js`, and `referral-consent-v2.css`.
New submissions omit `sms_consent`; no texting opt-in is inferred.
Historical SMS and form assets remain immutable for existing pages and records.

The current Resolution notice uses Cameron's exact sentence: “By submitting this form, you agree that Unfuck Your Taxes may share your information with third-party tax service providers who may contact you about your inquiry.”
It contains no extra policy link; Privacy and Terms links remain in the footer.

The non-Resolution enquiry notice is plain text only: the sensitive-document warning
has been removed. Privacy Policy and Terms links appear together in the footer
disclaimer; no policy link is appended to either form's enquiry/referral notice.
