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

The public `/contact` form and final contact step of `/quiz` offer **one optional,
unchecked marketing-text checkbox**. Service/customer-care text consent is deferred
for a separate booking/onboarding flow, at Cameron's direction. It must not be
inferred from this marketing choice or bundled with accepting an agreement.

Only these two pages load `sms-consent-v2.js` and its companion stylesheet. A single
compact block carries the text choice, short required disclosure and links to
`/privacy#text-messages` and `/terms#text-messages`. Repeated form and footer notices
were removed on these two pages; general site terms remain on `/terms`. Phone is
optional unless texting is selected. For Twilio's Web Form opt-in proof, use
`https://unfuckyourtaxes.com/contact` and register this flow for **Marketing only**.
Do not claim it collects separate service-update or customer-care consent.

`lead-form-v7.js` and `quiz-v27.js` submit `sms_consent` with `scope: marketing`,
the marketing choice, `service_updates: false`, exact displayed wording, policy
links, version, timestamp and source page. The existing production lead Worker
stores the complete request in `leads.payload_json`, or `lead_submissions.payload_json`
for a repeat submission, along with server-side submission time, IP and user agent.
Old leads without explicit consent have no text enrollment. This website change
does not enable outbound SMS or change messaging settings. Before sending, honor
the latest applicable consent and provider suppression, send the appropriate
welcome confirmation, and configure/test branded HELP and STOP handling.

Keep released consent versions immutable so recorded wording remains reproducible.
The first release (`v1`) collected two independent consents; `v2` replaces it with
marketing only. Older form/quiz assets remain available for already-open pages.

Requirements checked against Twilio's [Toll-Free Verification Onboarding Guide](https://help.twilio.com/articles/13264118705051-Required-Information-for-Toll-Free-Verification).
