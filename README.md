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

## SMS opt-in proof (November 9, 2026)

The public `/contact` form and the final contact step of `/quiz` offer separate,
unchecked choices for service/customer-care updates and automated marketing.
Phone and text enrollment are optional; selecting texts requires a valid phone.
Only these two pages load `sms-consent-v1.js` and its small companion stylesheet.
The matching SMS policy sections are `/privacy#text-messages` and
`/terms#text-messages`. For Twilio's Web Form opt-in proof, use
`https://unfuckyourtaxes.com/contact`.

`lead-form-v7.js` and `quiz-v26.js` submit `sms_consent` with both independent
choices, the exact displayed wording, policy links, version, timestamp and source
page. The existing production lead Worker stores the complete request in
`leads.payload_json`, or `lead_submissions.payload_json` for a repeat submission,
along with server-side submission time, IP and user agent. Old leads without
explicit consent have no text enrollment. Before any outbound SMS integration,
honor the latest applicable consent and provider suppression, send the appropriate
welcome confirmation, and configure/test branded HELP and STOP handling.
This website change does not enable outbound SMS or alter any messaging settings.

Keep the versioned consent script immutable so previously recorded wording remains
reproducible. Create a new version when the disclosure changes. Keep the older
quiz/form assets available for already-open pages.

Requirements checked against Twilio's [Toll-Free Verification Onboarding Guide](https://help.twilio.com/articles/13264118705051-Required-Information-for-Toll-Free-Verification).
