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
unchecked checkbox for submission/case updates**, using Cameron's exact wording:

> Yes, I would like to receive automated texts from UFYT about your form submission, tax case, and important updates.

This wording collects informational service-update consent, not marketing consent.
The privacy/terms descriptions and receipt match that scope. The earlier plan for
marketing here and service consent later was superseded by this explicit wording.
Promotional texts require a separate applicable opt-in; no such control is currently
present. The booking flow is unchanged.

Both forms load `sms-consent-v4.js` with the existing `sms-consent-v3.css` layout.
The checkbox is immediately above Submit; the supporting language and policy links
are below Submit. Phone is optional unless texting is selected. Twilio proof URL:
`https://unfuckyourtaxes.com/contact`. Match registration categories to submission,
customer-care and case/service updates; this proof does not grant marketing consent.

`lead-form-v7.js` and `quiz-v28.js` submit `sms_consent` with `scope: service_updates`,
`service_updates` true/false, `marketing: false`, exact wording, policy links, version,
timestamp and source page. The existing Worker stores full requests in
`leads.payload_json` or `lead_submissions.payload_json` for repeats, plus server-side
time, IP and user agent. Old leads without explicit consent have no text enrollment.
This website change does not enable outbound SMS or change messaging settings.
Before sending, honor applicable consent and suppression and configure/test welcome,
HELP and STOP behavior. Do not include sensitive tax records in texts.

Released consent versions stay immutable for historical evidence. `v1` collected
two independent choices; `v2` narrowed to marketing; `v3` moved that choice before
Submit and its explanation below. Current `v4` replaces the wording with the exact
submission/case-update sentence above and records the matching informational scope.
Older scripts remain available for already-open pages.

Requirements reference: [Twilio Toll-Free Verification Onboarding Guide](https://help.twilio.com/articles/13264118705051-Required-Information-for-Toll-Free-Verification).
