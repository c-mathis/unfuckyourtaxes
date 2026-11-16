# UFYT Lead Desk

Spreadsheet-style view of `source = 'taxes'` records in the shared
`unfuck-leads` D1 database. The dashboard has no login requirement and sets
`no-store` and `noindex` response headers.

The sales view shows contact information, the literal question/answer fields,
and privacy-safe source and page-journey attribution submitted through the UFYT
form. The CSV also includes the GA client/session IDs and shared lead event ID
for analysis; tax answers are never sent to GA or ad platforms.

Each value has its own spreadsheet column. The single header row is frozen inside
the table scroll area so it stays aligned without covering lead rows.

The shared UFYT CRM navigation links this lead desk to `https://inbox.ufyt.dev/`.
The inbox links back here, so an authenticated private-link session can move
between lead data and email without signing in again.

Production: `https://ufyt-leads-dash.pages.dev`

The All leads, UFYT, and Resolution tabs share the same D1 lead records. New
resolution leads show Five Star delivery state and record ID, and a separate
pending/sold/paid/rejected sale field. Delivery does not mark a lead sold.
Historical leads retain their UFYT route. CSV exports follow the active tab and
filters and include route, delivery, partner ID, and sale status.

Resolution intake uses `quiz-v29.js` / `lead-form-v8.js` and the versioned,
separate referral-consent control in `resolution-consent-v1.js`. Those leads
see `/resolution-thank-you`; the public form does not enqueue delivery itself.

Deploy with `wrangler pages deploy` from this directory.
