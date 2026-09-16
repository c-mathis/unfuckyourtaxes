# UFYT Lead Desk

Spreadsheet-style view of `source = 'taxes'` records in the shared
`unfuck-leads` D1 database. The dashboard has no login requirement and sets
`no-store` and `noindex` response headers.

The sales view shows contact information and the literal question/answer fields
submitted through the UFYT form. Attribution fields and internal lead scores are
intentionally omitted from the table and CSV export.

Each value has its own spreadsheet column. The single header row is frozen inside
the table scroll area so it stays aligned without covering lead rows.

Deploy with Wrangler from this directory.
