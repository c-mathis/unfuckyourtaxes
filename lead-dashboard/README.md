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

Deploy with `wrangler pages deploy` from this directory.
