# UFYT Lead Desk

Private, spreadsheet-style view of `source = 'taxes'` records in the shared
`unfuck-leads` D1 database. The dashboard is protected with HTTP Basic Auth,
sets `no-store`, and never embeds credentials in the client bundle.

Deploy with Wrangler from this directory. Set `DASHBOARD_PASSWORD` as a Worker
secret before first use.
